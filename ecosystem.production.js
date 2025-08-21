// 🚀 Optimized PM2 Ecosystem for Professional CI/CD Pipeline
// Target: <2 minute deployments with enterprise-grade performance

module.exports = {
  apps: [
    {
      name: 'bankimonline-api',
      script: './server/server-db.js',
      
      // Performance Optimization
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      
      // Resource Management
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=512',
      
      // Environment Configuration
      env: {
        NODE_ENV: 'development',
        PORT: 8003,
        PM2_SERVE_PATH: './mainapp/build',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: true,
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 8003,
        PM2_SERVE_PATH: './mainapp/build',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: true,
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      
      // Logging Configuration
      log_file: './logs/pm2-api-combined.log',
      out_file: './logs/pm2-api-out.log',
      error_file: './logs/pm2-api-error.log',
      log_type: 'json',
      merge_logs: true,
      time: true,
      
      // Restart Strategy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 1000,
      
      // Health Monitoring
      health_check_url: 'http://localhost:8003/api/health',
      health_check_grace_period: 10000,
      
      // Process Management
      listen_timeout: 8000,
      kill_timeout: 5000,
      shutdown_with_message: true,
      
      // Performance Monitoring
      pmx: true,
      instance_var: 'INSTANCE_ID',
      
      // Advanced Configuration
      source_map_support: false,
      disable_source_map_support: true,
      
      // Docker Optimization
      increment_var: 'PORT',
      combine_logs: true
    }
  ],

  // Deployment Configuration (Blue-Green Strategy)
  deploy: {
    production: {
      user: 'root',
      host: '45.83.42.74',
      ref: 'origin/main',
      repo: 'https://github.com/MichaelMishaev/bankDev2_standalone.git',
      path: '/app',
      
      // Pre-deployment Hooks
      'pre-deploy-local': '',
      
      // Post-deployment Hooks with Health Checks
      'post-deploy': [
        'docker build -f Dockerfile.optimized -t bankimonline:latest .',
        'docker stop bankimonline-blue 2>/dev/null || true',
        'docker run -d --name bankimonline-green -p 8004:8003 --env-file .env.production bankimonline:latest',
        'sleep 15',
        'curl -f http://localhost:8004/api/health',
        'docker stop bankimonline-green 2>/dev/null || true',
        'docker rm bankimonline-green 2>/dev/null || true',
        'docker stop bankimonline-blue 2>/dev/null || true',
        'docker rm bankimonline-blue 2>/dev/null || true',
        'docker run -d --name bankimonline-blue -p 8003:8003 --env-file .env.production bankimonline:latest',
        'sleep 10',
        'curl -f http://localhost:8003/api/health || (docker logs bankimonline-blue && exit 1)'
      ].join(' && '),
      
      // Setup Hooks
      'pre-setup': ''
    }
  },

  // Blue-Green Deployment Configuration
  blueGreen: {
    production: {
      blue: {
        name: 'bankimonline-blue',
        port: 8003,
        container: 'bankimonline-blue'
      },
      green: {
        name: 'bankimonline-green', 
        port: 8004,
        container: 'bankimonline-green'
      },
      healthCheck: {
        url: '/api/health',
        timeout: 30000,
        retries: 5,
        interval: 2000
      }
    }
  }
};