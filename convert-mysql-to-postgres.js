#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Converting MySQL backup to PostgreSQL format...\n');

const inputFile = 'backup1_2025-05-27_00-36-37.sql';
const outputFile = 'backup1_postgresql.sql';

if (!fs.existsSync(inputFile)) {
    console.error('❌ Input file not found:', inputFile);
    process.exit(1);
}

console.log(`📖 Reading MySQL backup: ${inputFile}`);
let sqlContent = fs.readFileSync(inputFile, 'utf8');

console.log('🛠️  Applying MySQL to PostgreSQL conversions...');

// Track conversions
let conversions = 0;

// 1. Remove MySQL-specific headers and settings
sqlContent = sqlContent.replace(/SET SQL_MODE[^;]*;/gi, '');
sqlContent = sqlContent.replace(/SET FOREIGN_KEY_CHECKS[^;]*;/gi, '');
sqlContent = sqlContent.replace(/SET AUTOCOMMIT[^;]*;/gi, '');
sqlContent = sqlContent.replace(/SET UNIQUE_CHECKS[^;]*;/gi, '');
sqlContent = sqlContent.replace(/SET character_set_client[^;]*;/gi, '');
sqlContent = sqlContent.replace(/\/\*![0-9]+ SET[^*]*\*\//gi, '');
conversions += 6;

// 2. Convert data types
// MySQL bigint(20) -> PostgreSQL BIGINT
sqlContent = sqlContent.replace(/bigint\(\d+\)/gi, 'BIGINT');
// MySQL int(11) -> PostgreSQL INTEGER
sqlContent = sqlContent.replace(/int\(\d+\)/gi, 'INTEGER');
// MySQL varchar(255) -> PostgreSQL VARCHAR(255) (stays the same)
// MySQL text -> PostgreSQL TEXT (stays the same)
// MySQL timestamp -> PostgreSQL TIMESTAMP
sqlContent = sqlContent.replace(/timestamp NULL DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
conversions += 4;

// 3. Convert AUTO_INCREMENT to SERIAL/BIGSERIAL
sqlContent = sqlContent.replace(/bigint.*?unsigned NOT NULL AUTO_INCREMENT/gi, 'BIGSERIAL');
sqlContent = sqlContent.replace(/int.*?unsigned NOT NULL AUTO_INCREMENT/gi, 'SERIAL');
conversions += 2;

// 4. Remove unsigned attributes
sqlContent = sqlContent.replace(/\s+unsigned/gi, '');
conversions += 1;

// 5. Convert MySQL ENGINE and CHARSET
sqlContent = sqlContent.replace(/\) ENGINE=InnoDB[^;]*;/gi, ');');
conversions += 1;

// 6. Convert KEY definitions to CREATE INDEX
// This is more complex - we'll remove them for now and add them separately
sqlContent = sqlContent.replace(/,\s*KEY `[^`]+`[^,\)]*(?=,|\))/gi, '');
conversions += 1;

// 7. Convert MySQL boolean values
sqlContent = sqlContent.replace(/tinyint\(1\)/gi, 'BOOLEAN');
conversions += 1;

// 8. Fix CONSTRAINT syntax
sqlContent = sqlContent.replace(/CONSTRAINT `([^`]+)` FOREIGN KEY/gi, 'CONSTRAINT $1 FOREIGN KEY');
conversions += 1;

// 9. Convert MySQL date functions
sqlContent = sqlContent.replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP');
conversions += 1;

// 10. Remove backticks around identifiers (PostgreSQL uses double quotes if needed)
sqlContent = sqlContent.replace(/`([^`]+)`/g, '"$1"');
conversions += 1;

// 11. Convert ENUM types (PostgreSQL handles these differently)
// For now, we'll convert them to VARCHAR
sqlContent = sqlContent.replace(/enum\([^)]+\)/gi, 'VARCHAR(50)');
conversions += 1;

// 12. Add PostgreSQL-specific settings at the beginning
const pgHeader = `-- PostgreSQL version of MySQL backup
-- Converted on ${new Date().toISOString()}
-- Original file: ${inputFile}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

`;

sqlContent = pgHeader + sqlContent;

// 13. Clean up extra whitespace and newlines
sqlContent = sqlContent.replace(/\n\s*\n\s*\n/g, '\n\n');

console.log(`✅ Applied ${conversions} conversion rules`);
console.log(`💾 Writing PostgreSQL backup: ${outputFile}`);

fs.writeFileSync(outputFile, sqlContent);

const originalSize = fs.statSync(inputFile).size;
const convertedSize = fs.statSync(outputFile).size;

console.log('\n📊 Conversion Summary:');
console.log(`   Original (MySQL): ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Converted (PostgreSQL): ${(convertedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Reduction: ${((originalSize - convertedSize) / originalSize * 100).toFixed(1)}%`);

console.log('\n⚠️  Important Notes:');
console.log('   1. Some MySQL-specific features may need manual adjustment');
console.log('   2. Check data types and constraints after import');
console.log('   3. You may need to recreate indexes manually');
console.log('   4. Test the import on your Railway PostgreSQL database');

console.log('\n🚀 Next Steps:');
console.log(`   1. Upload ${outputFile} to your Railway PostgreSQL database`);
console.log('   2. Run: node test-db.js to test the connection');
console.log('   3. Update server.js to use the real database');

console.log('\n✅ MySQL to PostgreSQL conversion completed!'); 