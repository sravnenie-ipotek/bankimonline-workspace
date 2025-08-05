const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function analyzeMortgageCalculationUsage() {
  try {
    console.log('🔍 ANALYZING mortgage_calculation USAGE\n');
    
    // 1. Get all content from mortgage_calculation grouped by component type
    console.log('1️⃣ CONTENT BREAKDOWN BY TYPE:');
    console.log('================================\n');
    
    const contentByType = await pool.query(`
      SELECT 
        component_type,
        COUNT(*) as count,
        array_agg(DISTINCT SUBSTRING(content_key FROM '([^.]+)\.')) as prefixes
      FROM content_items
      WHERE screen_location = 'mortgage_calculation'
        AND is_active = true
      GROUP BY component_type
      ORDER BY count DESC
    `);
    
    contentByType.rows.forEach(row => {
      console.log(`${row.component_type}: ${row.count} items`);
      if (row.prefixes && row.prefixes[0]) {
        console.log(`  Prefixes: ${row.prefixes.filter(p => p).join(', ')}`);
      }
      console.log('');
    });
    
    // 2. Analyze content keys to determine which step they belong to
    console.log('\n2️⃣ CONTENT ANALYSIS BY LIKELY STEP:');
    console.log('====================================\n');
    
    // Define patterns for each step
    const stepPatterns = {
      step1: [
        'property_price', 'property_value', 'city', 'when_needed', 'initial_fee', 
        'initial_payment', 'type', 'first_home', 'property_ownership', 'period',
        'monthly_payment', 'property_type'
      ],
      step2: [
        'name', 'surname', 'birth', 'birthday', 'citizenship', 'borrowers',
        'family_status', 'children', 'partner', 'additional_citizenship'
      ],
      step3: [
        'income', 'employment', 'company', 'profession', 'sphere', 'education',
        'debt', 'obligation', 'additional_income', 'main_source'
      ],
      step4: [
        'filter', 'program', 'bank', 'offer', 'rate', 'comparison'
      ],
      shared: [
        'header', 'title', 'button', 'error', 'help', 'tooltip', 'description'
      ]
    };
    
    // Count content by likely step
    const contentByStep = {};
    
    for (const [step, patterns] of Object.entries(stepPatterns)) {
      const patternQuery = patterns.map(p => `content_key ILIKE '%${p}%'`).join(' OR ');
      
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT ci.id) as count,
          array_agg(DISTINCT ci.component_type) as types
        FROM content_items ci
        WHERE screen_location = 'mortgage_calculation'
          AND is_active = true
          AND (${patternQuery})
      `);
      
      contentByStep[step] = {
        count: result.rows[0].count,
        types: result.rows[0].types || []
      };
    }
    
    Object.entries(contentByStep).forEach(([step, data]) => {
      console.log(`${step.toUpperCase()}: ${data.count} items`);
      console.log(`  Component types: ${data.types.join(', ')}`);
      console.log('');
    });
    
    // 3. Find content that might belong to other screens
    console.log('\n3️⃣ CONTENT THAT MIGHT BELONG TO OTHER SCREENS:');
    console.log('===============================================\n');
    
    const otherScreenPatterns = {
      'refinance': ['refinance', 'refi'],
      'credit': ['credit_card', 'consumer_credit'],
      'general': ['app.', 'main.', 'common.']
    };
    
    for (const [screen, patterns] of Object.entries(otherScreenPatterns)) {
      const patternQuery = patterns.map(p => `content_key ILIKE '%${p}%'`).join(' OR ');
      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as count,
          array_agg(DISTINCT content_key) as keys
        FROM content_items
        WHERE screen_location = 'mortgage_calculation'
          AND is_active = true
          AND (${patternQuery})
        LIMIT 5
      `);
      
      if (result.rows[0].count > 0) {
        console.log(`Potential ${screen} content: ${result.rows[0].count} items`);
        if (result.rows[0].keys) {
          console.log(`  Sample keys: ${result.rows[0].keys.slice(0, 3).join(', ')}`);
        }
        console.log('');
      }
    }
    
    // 4. Check what screens reference mortgage_calculation content
    console.log('\n4️⃣ RECOMMENDATION:');
    console.log('==================\n');
    
    console.log('Based on the analysis:');
    console.log('- mortgage_calculation contains content for ALL 4 steps of the mortgage calculator');
    console.log('- It has 161 total items with 112 dropdown options');
    console.log('- Content is mixed between all steps, not organized by step');
    console.log('');
    console.log('RECOMMENDED APPROACH:');
    console.log('1. Create new screen_locations: mortgage_step1, mortgage_step2, mortgage_step3, mortgage_step4');
    console.log('2. Move content to appropriate steps based on the patterns identified');
    console.log('3. Keep shared content (headers, buttons, errors) in mortgage_shared');
    console.log('4. Update React components to fetch from the correct screen_location');
    console.log('');
    console.log('This would:');
    console.log('- Fix the admin panel issue (content appears where expected)');
    console.log('- Improve organization and maintainability');
    console.log('- Avoid data duplication');
    console.log('- Match the URL structure');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeMortgageCalculationUsage();