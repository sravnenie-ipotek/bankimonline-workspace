#!/usr/bin/env node
// Script to fix credit migration files for actual database structure
const fs = require('fs');
const path = require('path');

const migrationFiles = [
    'migrate_credit_step2.sql',
    'migrate_credit_step3.sql', 
    'migrate_credit_step4.sql'
];

function fixMigrationFile(filename) {
    const originalPath = path.join(__dirname, 'migrations', filename);
    const fixedPath = path.join(__dirname, 'migrations', filename.replace('.sql', '_fixed.sql'));
    
    if (!fs.existsSync(originalPath)) {
        console.error(`❌ Original file not found: ${originalPath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(originalPath, 'utf8');
        
        // Fix column names and structure
        content = content.replace(/content_key/g, 'key');
        content = content.replace(/content_value/g, 'value');
        
        // Fix INSERT statement structure
        content = content.replace(
            /INSERT INTO content_items \(\s*key,\s*component_type,\s*category,\s*screen_location,\s*description,\s*is_active,\s*legacy_translation_key,\s*created_at,\s*updated_at\s*\)/g,
            'INSERT INTO content_items (\n    key, \n    component_type, \n    category, \n    screen_location, \n    status,\n    created_at,\n    updated_at\n)'
        );
        
        // Fix VALUES entries - remove description, is_active, legacy_translation_key
        content = content.replace(
            /\('([^']+)', '([^']+)', '([^']+)', '([^']+)', '[^']*', true, '[^']*', NOW\(\), NOW\(\)\)/g,
            "('$1', '$2', '$3', '$4', 'active', NOW(), NOW())"
        );
        
        // Fix ON CONFLICT clause
        content = content.replace(/ON CONFLICT \(key\) DO NOTHING/g, 'ON CONFLICT (key, screen_location) DO NOTHING');
        
        // Fix content_translations references
        content = content.replace(/content_item_id, language_code, value, status/g, 'content_item_id, language_code, value, status');
        
        // Fix the SELECT statements in translations
        content = content.replace(/CASE ci\.key/g, 'CASE ci.key');
        
        fs.writeFileSync(fixedPath, content);
        console.log(`✅ Created fixed version: ${fixedPath}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error fixing ${filename}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🔧 Fixing credit migration files...\n');
    
    let fixedCount = 0;
    
    migrationFiles.forEach(filename => {
        if (fixMigrationFile(filename)) {
            fixedCount++;
        }
    });
    
    console.log(`\n✅ Fixed ${fixedCount}/${migrationFiles.length} migration files`);
    console.log('\nFixed files created:');
    migrationFiles.forEach(filename => {
        const fixedName = filename.replace('.sql', '_fixed.sql');
        console.log(`  - migrations/${fixedName}`);
    });
    
    console.log('\n💡 Next step: Run node run-credit-migrations.js');
}

main();