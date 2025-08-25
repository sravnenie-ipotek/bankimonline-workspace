#!/usr/bin/env node

/**
 * CI/CD Environment Generator
 * 
 * Generates environment configuration for CI/CD from LOCAL .env
 * This ensures CI/CD uses EXACTLY the same database configuration as local development
 * 
 * LOCAL .env IS THE SOURCE OF TRUTH!
 */

const fs = require('fs');
const path = require('path');
const { validateAllDatabaseConfigs, generateCICDConfig } = require('../server/config/database-truth');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function generateGitHubSecretsScript() {
    // Validate that .env has all required configurations
    validateAllDatabaseConfigs();
    
    const config = generateCICDConfig();
    
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log(`${YELLOW}  CI/CD ENVIRONMENT CONFIGURATION${RESET}`);
    console.log(`${YELLOW}  Generated from LOCAL .env (SOURCE OF TRUTH)${RESET}`);
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log('');
    
    console.log(`${GREEN}GitHub Secrets to Set:${RESET}`);
    console.log(`${GREEN}══════════════════════${RESET}`);
    console.log('');
    
    // Generate GitHub CLI commands
    console.log(`${YELLOW}# Run these commands to update GitHub Secrets:${RESET}`);
    console.log('');
    
    if (config.DATABASE_URL) {
        console.log(`gh secret set DATABASE_URL --body "${config.DATABASE_URL}"`);
    }
    
    if (config.CONTENT_DATABASE_URL) {
        console.log(`gh secret set CONTENT_DATABASE_URL --body "${config.CONTENT_DATABASE_URL}"`);
    }
    
    if (config.MANAGEMENT_DATABASE_URL) {
        console.log(`gh secret set MANAGEMENT_DATABASE_URL --body "${config.MANAGEMENT_DATABASE_URL}"`);
    }
    
    // Add other required environment variables
    if (process.env.JWT_SECRET) {
        console.log(`gh secret set JWT_SECRET --body "${process.env.JWT_SECRET}"`);
    }
    
    console.log('');
    console.log(`${GREEN}GitHub Actions Environment Variables:${RESET}`);
    console.log(`${GREEN}═════════════════════════════════════${RESET}`);
    console.log('');
    
    // Generate env format for GitHub Actions
    console.log(`${YELLOW}# Add to .github/workflows/deploy-multi-env.yml:${RESET}`);
    console.log('```yaml');
    console.log('env:');
    console.log(`  DATABASE_URL: \${{ secrets.DATABASE_URL }}`);
    if (config.CONTENT_DATABASE_URL) {
        console.log(`  CONTENT_DATABASE_URL: \${{ secrets.CONTENT_DATABASE_URL }}`);
    }
    if (config.MANAGEMENT_DATABASE_URL) {
        console.log(`  MANAGEMENT_DATABASE_URL: \${{ secrets.MANAGEMENT_DATABASE_URL }}`);
    }
    console.log(`  JWT_SECRET: \${{ secrets.JWT_SECRET }}`);
    console.log('```');
    
    // Generate .env.ci file for CI/CD
    const envCiPath = path.join(__dirname, '..', '.env.ci');
    const envContent = [];
    
    envContent.push('# CI/CD Environment Configuration');
    envContent.push('# Generated from LOCAL .env (SOURCE OF TRUTH)');
    envContent.push(`# Generated at: ${config.generated_at}`);
    envContent.push('');
    
    if (config.DATABASE_URL) {
        envContent.push(`DATABASE_URL=${config.DATABASE_URL}`);
    }
    
    if (config.CONTENT_DATABASE_URL) {
        envContent.push(`CONTENT_DATABASE_URL=${config.CONTENT_DATABASE_URL}`);
    }
    
    if (config.MANAGEMENT_DATABASE_URL) {
        envContent.push(`MANAGEMENT_DATABASE_URL=${config.MANAGEMENT_DATABASE_URL}`);
    }
    
    if (process.env.JWT_SECRET) {
        envContent.push(`JWT_SECRET=${process.env.JWT_SECRET}`);
    }
    
    envContent.push(`PORT=${process.env.PORT || 8003}`);
    envContent.push(`NODE_ENV=production`);
    
    fs.writeFileSync(envCiPath, envContent.join('\n'));
    
    console.log('');
    console.log(`${GREEN}✅ Generated .env.ci file for CI/CD${RESET}`);
    console.log(`${GREEN}✅ Location: ${envCiPath}${RESET}`);
    
    // Create validation script for CI/CD
    const validationScript = `
#!/bin/bash
# CI/CD Database Configuration Validation
# This script MUST pass before deployment

echo "🔍 Validating CI/CD database configuration..."

# Check that all required environment variables are set
MISSING_VARS=""

if [ -z "$DATABASE_URL" ]; then
    MISSING_VARS="$MISSING_VARS DATABASE_URL"
fi

if [ -z "$JWT_SECRET" ]; then
    MISSING_VARS="$MISSING_VARS JWT_SECRET"
fi

if [ -n "$MISSING_VARS" ]; then
    echo "❌ DEPLOYMENT BLOCKED: Missing environment variables: $MISSING_VARS"
    echo "❌ LOCAL .env is the SOURCE OF TRUTH!"
    echo "❌ Run: npm run generate:cicd-env"
    exit 1
fi

echo "✅ All required environment variables present"
echo "✅ Using configuration from LOCAL .env (SOURCE OF TRUTH)"
exit 0
`;

    const validationPath = path.join(__dirname, 'validate-cicd-env.sh');
    fs.writeFileSync(validationPath, validationScript);
    fs.chmodSync(validationPath, '755');
    
    console.log(`${GREEN}✅ Generated CI/CD validation script${RESET}`);
    console.log(`${GREEN}✅ Location: ${validationPath}${RESET}`);
    
    console.log('');
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log(`${YELLOW}IMPORTANT: CI/CD Setup Instructions${RESET}`);
    console.log(`${YELLOW}═══════════════════════════════════════════${RESET}`);
    console.log('');
    console.log(`1. ${YELLOW}Update GitHub Secrets:${RESET}`);
    console.log(`   Run the gh secret commands shown above`);
    console.log('');
    console.log(`2. ${YELLOW}Update GitHub Actions workflow:${RESET}`);
    console.log(`   Add the environment variables to .github/workflows/deploy-multi-env.yml`);
    console.log('');
    console.log(`3. ${YELLOW}Add validation to CI/CD pipeline:${RESET}`);
    console.log(`   Add this step before deployment:`);
    console.log(`   ${GREEN}- name: Validate database configuration${RESET}`);
    console.log(`   ${GREEN}  run: bash scripts/validate-cicd-env.sh${RESET}`);
    console.log('');
    console.log(`${GREEN}✅ LOCAL .env is the SOURCE OF TRUTH!${RESET}`);
    console.log(`${GREEN}✅ CI/CD will now use EXACT same database configuration${RESET}`);
}

// Main execution
async function main() {
    try {
        generateGitHubSecretsScript();
    } catch (error) {
        console.error(`${RED}❌ Error: ${error.message}${RESET}`);
        process.exit(1);
    }
}

main();