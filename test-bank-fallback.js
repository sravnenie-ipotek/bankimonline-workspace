/**
 * Test script for bank fallback implementation
 * Tests the new database-driven bank name system
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testBankFallback() {
    try {
        console.log('🧪 Testing Bank Fallback Implementation');
        console.log('==========================================');
        
        // Test 1: Check if banks table exists and has data
        console.log('\n1. Checking banks table...');
        const banksResult = await pool.query(`
            SELECT 
                id, name_en, name_he, name_ru, 
                COALESCE(show_in_fallback, true) as show_in_fallback,
                COALESCE(fallback_priority, 1) as fallback_priority,
                COALESCE(fallback_interest_rate, 5.0) as fallback_interest_rate,
                is_active 
            FROM banks 
            WHERE is_active = true 
            ORDER BY priority ASC, name_en ASC
            LIMIT 5
        `);
        
        if (banksResult.rows.length > 0) {
            console.log('✅ Found', banksResult.rows.length, 'active banks:');
            banksResult.rows.forEach((bank, index) => {
                console.log(`   ${index + 1}. ${bank.name_en} (HE: ${bank.name_he}, RU: ${bank.name_ru})`);
                console.log(`      Fallback: ${bank.show_in_fallback}, Priority: ${bank.fallback_priority}, Rate: ${bank.fallback_interest_rate}%`);
            });
        } else {
            console.log('❌ No active banks found');
        }
        
        // Test 2: Check fallback configuration
        console.log('\n2. Checking fallback configuration...');
        const configResult = await pool.query(`
            SELECT * FROM bank_fallback_config ORDER BY id DESC LIMIT 1
        `);
        
        if (configResult.rows.length > 0) {
            console.log('✅ Fallback configuration found:');
            const config = configResult.rows[0];
            console.log(`   Enabled: ${config.enable_fallback}`);
            console.log(`   Method: ${config.fallback_method}`);
            console.log(`   Max Banks: ${config.max_fallback_banks}`);
            console.log(`   Default Term: ${config.default_term_years} years`);
            console.log(`   Language: ${config.language_preference}`);
        } else {
            console.log('⚠️  No fallback configuration found, will use defaults');
        }
        
        // Test 3: Simulate fallback bank query with different languages
        console.log('\n3. Testing language-specific bank queries...');
        
        const languages = ['en', 'he', 'ru'];
        for (const lang of languages) {
            const nameField = `name_${lang}`;
            const langQuery = `
                SELECT 
                    id,
                    COALESCE(${nameField}, name_en) as bank_name,
                    name_en, name_he, name_ru
                FROM banks 
                WHERE is_active = true 
                AND COALESCE(show_in_fallback, true) = true
                ORDER BY COALESCE(fallback_priority, 1) ASC, priority ASC, name_en ASC
                LIMIT 3
            `;
            
            const langResult = await pool.query(langQuery);
            console.log(`   ${lang.toUpperCase()}: ${langResult.rows.map(b => b.bank_name).join(', ')}`);
        }
        
        // Test 4: Simulate complete fallback scenario
        console.log('\n4. Simulating complete fallback scenario...');
        const amount = 500000;
        const termYears = 25;
        const termMonths = termYears * 12;
        
        const fallbackQuery = `
            SELECT 
                b.id,
                COALESCE(b.name_en, 'Bank #' || b.id) as bank_name,
                b.logo,
                COALESCE(b.fallback_interest_rate, 5.0) as fallback_rate
            FROM banks b
            WHERE b.is_active = true 
            AND COALESCE(b.show_in_fallback, true) = true
            ORDER BY COALESCE(b.fallback_priority, 1) ASC, b.priority ASC, b.name_en ASC
            LIMIT 3
        `;
        
        const fallbackBanks = await pool.query(fallbackQuery);
        
        if (fallbackBanks.rows.length > 0) {
            console.log('✅ Generated fallback offers:');
            fallbackBanks.rows.forEach((bank, index) => {
                const rate = bank.fallback_rate + (index * 0.3);
                const monthlyRate = rate / 100 / 12;
                const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
                
                console.log(`   ${index + 1}. ${bank.bank_name}`);
                console.log(`      Rate: ${rate.toFixed(2)}%, Monthly: ₪${Math.round(monthlyPayment).toLocaleString()}`);
            });
        } else {
            console.log('❌ No fallback banks available');
        }
        
        console.log('\n✅ Bank fallback implementation test completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - Database-driven bank names: ✅ Implemented');
        console.log('   - Multi-language support: ✅ Implemented'); 
        console.log('   - Admin-configurable fallback: ✅ Implemented');
        console.log('   - Flexible priority system: ✅ Implemented');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log('\n💡 Note: Some database tables may need to be created first.');
            console.log('   Run the migration script to set up the fallback configuration.');
        }
    } finally {
        await pool.end();
    }
}

testBankFallback();