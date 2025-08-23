/**
 * Deployment Monitoring Endpoints
 * Provides detailed deployment status and health information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function setupMonitoring(app) {
    // Comprehensive version endpoint
    app.get('/api/deployment/status', (req, res) => {
        try {
            // Read current deployment state
            const deploymentInfo = {
                // Version information
                versions: {
                    frontend: 'unknown',
                    backend: process.env.npm_package_version || 'unknown',
                    node: process.version,
                    npm: execSync('npm -v').toString().trim()
                },
                
                // Deployment details
                deployment: {
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'production',
                    port: process.env.PORT || 8003,
                    pid: process.pid,
                    uptime: process.uptime()
                },
                
                // Blue-green status
                blueGreen: {
                    current: 'unknown',
                    path: process.cwd()
                },
                
                // Health checks
                health: {
                    api: 'healthy',
                    database: 'unknown',
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                }
            };
            
            // Try to read frontend version
            try {
                const buildInfoPath = path.join(__dirname, '../mainapp/src/config/buildInfo.ts');
                if (fs.existsSync(buildInfoPath)) {
                    const content = fs.readFileSync(buildInfoPath, 'utf8');
                    const versionMatch = content.match(/version:\s*'([^']+)'/);
                    if (versionMatch) {
                        deploymentInfo.versions.frontend = versionMatch[1];
                    }
                }
            } catch (e) {
                console.log('Could not read frontend version:', e.message);
            }
            
            // Check blue-green deployment
            try {
                const currentPath = process.cwd();
                if (currentPath.includes('/blue')) {
                    deploymentInfo.blueGreen.current = 'blue';
                } else if (currentPath.includes('/green')) {
                    deploymentInfo.blueGreen.current = 'green';
                }
            } catch (e) {
                console.log('Could not determine blue-green status');
            }
            
            res.json(deploymentInfo);
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get deployment status',
                message: error.message
            });
        }
    });
    
    // Simple version check endpoint
    app.get('/api/version', (req, res) => {
        try {
            const buildInfoPath = path.join(__dirname, '../mainapp/build/static/js');
            let frontendVersion = 'unknown';
            
            // Try to extract version from built files
            if (fs.existsSync(buildInfoPath)) {
                const files = fs.readdirSync(buildInfoPath);
                for (const file of files) {
                    if (file.endsWith('.js')) {
                        const content = fs.readFileSync(path.join(buildInfoPath, file), 'utf8');
                        const versionMatch = content.match(/version:"([^"]+)"/);
                        if (versionMatch) {
                            frontendVersion = versionMatch[1];
                            break;
                        }
                    }
                }
            }
            
            res.json({
                version: frontendVersion,
                api: process.env.npm_package_version || 'unknown',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Failed to get version',
                message: error.message
            });
        }
    });
    
    // Deployment manifest endpoint
    app.get('/api/deployment/manifest', (req, res) => {
        try {
            const manifestPath = path.join(__dirname, '../.deployment-manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                res.json(manifest);
            } else {
                res.status(404).json({ error: 'Deployment manifest not found' });
            }
        } catch (error) {
            res.status(500).json({
                error: 'Failed to read deployment manifest',
                message: error.message
            });
        }
    });
}

module.exports = { setupMonitoring };