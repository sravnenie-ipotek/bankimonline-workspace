#!/usr/bin/env node
require('dotenv').config();
const { Pool } = require('pg');

// Content database connection
const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkCreditRefinancingContent() {
    try {
        console.log('=== CREDIT REFINANCING CONTENT CHECK ===\n');

        // 1. Check content_items for credit refinancing
        console.log('1. Checking content_items for credit refinancing patterns...');
        const creditRefinancePatterns = await contentPool.query(`
            SELECT screen_location, category, content_type, COUNT(*) as count 
            FROM content_items 
            WHERE screen_location LIKE '%credit_refinanc%' 
               OR screen_location LIKE '%refinanc%credit%' 
               OR (screen_location LIKE '%refinanc%' AND category = 'credit')
               OR (category = 'credit' AND screen_location LIKE '%refinanc%')
               OR content_key LIKE '%credit%refinanc%'
            GROUP BY screen_location, category, content_type 
            ORDER BY screen_location, content_type
        `);
        
        console.log('Credit refinancing content found:');
        console.table(creditRefinancePatterns.rows);
        console.log(`Total credit refinancing items: ${creditRefinancePatterns.rows.reduce((sum, row) => sum + parseInt(row.count), 0)}\n`);

        // 2. Get detailed items with translation status
        console.log('2. Getting detailed credit refinancing items with translation status...');
        const detailedItems = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.screen_location,
                ci.category,
                ci.content_type,
                COUNT(DISTINCT ct.language_code) as languages_translated,
                STRING_AGG(DISTINCT ct.language_code, ', ' ORDER BY ct.language_code) as available_languages
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE ci.screen_location LIKE '%credit_refinanc%' 
               OR ci.screen_location LIKE '%refinanc%credit%' 
               OR (ci.screen_location LIKE '%refinanc%' AND ci.category = 'credit')
               OR (ci.category = 'credit' AND ci.screen_location LIKE '%refinanc%')
               OR ci.content_key LIKE '%credit%refinanc%'
            GROUP BY ci.id, ci.content_key, ci.screen_location, ci.category, ci.content_type
            ORDER BY ci.screen_location, ci.content_key
        `);
        
        console.log('Detailed credit refinancing items:');
        console.table(detailedItems.rows);

        // 3. Check for variations in naming
        console.log('\n3. Checking for naming variations...');
        const variations = await contentPool.query(`
            SELECT DISTINCT screen_location, category, COUNT(*) as count
            FROM content_items
            WHERE screen_location LIKE '%credit%' AND screen_location LIKE '%refinanc%'
               OR screen_location = 'refinance_credit'
               OR screen_location = 'credit_refinance'
               OR screen_location = 'refinancing_credit'
               OR screen_location = 'credit_refinancing'
            GROUP BY screen_location, category
            ORDER BY screen_location
        `);
        
        console.log('Screen location variations found:');
        console.table(variations.rows);

        // 4. Compare with mortgage refinancing for reference
        console.log('\n4. Comparing with mortgage refinancing content...');
        const mortgageRefinance = await contentPool.query(`
            SELECT 
                screen_location,
                category,
                content_type,
                COUNT(*) as count,
                COUNT(CASE WHEN content_type = 'dropdown' THEN 1 END) as dropdown_count
            FROM content_items
            WHERE screen_location LIKE '%mortgage_refinanc%' 
               OR (screen_location LIKE '%refinanc%' AND category = 'mortgage')
            GROUP BY screen_location, category, content_type
            ORDER BY screen_location
        `);
        
        console.log('Mortgage refinancing content for comparison:');
        console.table(mortgageRefinance.rows);

        // 5. Verify reported counts
        console.log('\n5. Verifying reported counts for all categories...');
        const categoryCounts = await contentPool.query(`
            SELECT 
                CASE 
                    WHEN screen_location LIKE '%general%' OR category = 'general' THEN 'General Pages'
                    WHEN screen_location LIKE '%mortgage_refinanc%' OR (screen_location LIKE '%refinanc%' AND category = 'mortgage') THEN 'Mortgage Refinancing'
                    WHEN screen_location LIKE '%credit_refinanc%' OR (screen_location LIKE '%refinanc%' AND category = 'credit') THEN 'Credit Refinancing'
                    WHEN category = 'mortgage' THEN 'Mortgage'
                    WHEN category = 'credit' THEN 'Credit'
                    ELSE 'Other'
                END as category_group,
                COUNT(*) as total_items,
                COUNT(CASE WHEN content_type = 'dropdown' THEN 1 END) as dropdown_count
            FROM content_items
            GROUP BY category_group
            ORDER BY category_group
        `);
        
        console.log('Category counts:');
        console.table(categoryCounts.rows);

        // 6. Check if there are any credit refinancing items without translations
        console.log('\n6. Checking for credit refinancing items without any translations...');
        const untranslated = await contentPool.query(`
            SELECT 
                ci.id,
                ci.content_key,
                ci.screen_location,
                ci.category,
                ci.content_type
            FROM content_items ci
            LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
            WHERE (ci.screen_location LIKE '%credit_refinanc%' 
               OR ci.screen_location LIKE '%refinanc%credit%' 
               OR (ci.screen_location LIKE '%refinanc%' AND ci.category = 'credit')
               OR (ci.category = 'credit' AND ci.screen_location LIKE '%refinanc%')
               OR ci.content_key LIKE '%credit%refinanc%')
            AND ct.id IS NULL
        `);
        
        console.log('Credit refinancing items without ANY translations:');
        if (untranslated.rows.length > 0) {
            console.table(untranslated.rows);
        } else {
            console.log('✅ All credit refinancing items have at least one translation');
        }

        // 7. Check translation completeness for credit refinancing
        console.log('\n7. Translation completeness for credit refinancing items...');
        const translationCompleteness = await contentPool.query(`
            SELECT 
                ci.screen_location,
                COUNT(DISTINCT ci.id) as total_items,
                COUNT(DISTINCT CASE WHEN ct_en.id IS NOT NULL THEN ci.id END) as with_english,
                COUNT(DISTINCT CASE WHEN ct_he.id IS NOT NULL THEN ci.id END) as with_hebrew,
                COUNT(DISTINCT CASE WHEN ct_ru.id IS NOT NULL THEN ci.id END) as with_russian,
                COUNT(DISTINCT CASE WHEN ct_en.id IS NOT NULL AND ct_he.id IS NOT NULL AND ct_ru.id IS NOT NULL THEN ci.id END) as fully_translated
            FROM content_items ci
            LEFT JOIN content_translations ct_en ON ci.id = ct_en.content_item_id AND ct_en.language_code = 'en'
            LEFT JOIN content_translations ct_he ON ci.id = ct_he.content_item_id AND ct_he.language_code = 'he'
            LEFT JOIN content_translations ct_ru ON ci.id = ct_ru.content_item_id AND ct_ru.language_code = 'ru'
            WHERE ci.screen_location LIKE '%credit_refinanc%' 
               OR ci.screen_location LIKE '%refinanc%credit%' 
               OR (ci.screen_location LIKE '%refinanc%' AND ci.category = 'credit')
               OR (ci.category = 'credit' AND ci.screen_location LIKE '%refinanc%')
               OR ci.content_key LIKE '%credit%refinanc%'
            GROUP BY ci.screen_location
            ORDER BY ci.screen_location
        `);
        
        console.log('Translation completeness by screen location:');
        console.table(translationCompleteness.rows);

    } catch (error) {
        console.error('Error checking credit refinancing content:', error);
    } finally {
        await contentPool.end();
    }
}

checkCreditRefinancingContent();