#!/usr/bin/env node

/**
 * Deployment Manifest Generator
 * Creates a manifest file with deployment details for tracking and rollback
 */

const fs = require('fs');
const { execSync } = require('child_process');

function generateManifest() {
    const manifest = {
        version: process.env.VERSION || 'unknown',
        timestamp: new Date().toISOString(),
        commit: process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim(),
        branch: process.env.GITHUB_REF_NAME || execSync('git branch --show-current').toString().trim(),
        build_number: process.env.GITHUB_RUN_NUMBER || 'local',
        deployer: process.env.GITHUB_ACTOR || 'local',
        environment: process.env.DEPLOY_ENV || 'unknown',
        
        // Deployment checks
        checks: {
            pre_deployment: [],
            post_deployment: [],
            rollback_available: false
        },
        
        // Files and versions
        files: {
            frontend_version: null,
            backend_version: null,
            database_migrations: []
        }
    };
    
    // Read actual versions from files
    try {
        const buildInfo = fs.readFileSync('mainapp/src/config/buildInfo.ts', 'utf8');
        const versionMatch = buildInfo.match(/version:\s*'([^']+)'/);
        if (versionMatch) {
            manifest.files.frontend_version = versionMatch[1];
        }
    } catch (e) {
        console.log('Could not read frontend version');
    }
    
    // Save manifest
    fs.writeFileSync('.deployment-manifest.json', JSON.stringify(manifest, null, 2));
    console.log('📋 Deployment manifest generated:', manifest);
    
    return manifest;
}

// Generate and output
const manifest = generateManifest();
console.log(`::set-output name=manifest::${JSON.stringify(manifest)}`);