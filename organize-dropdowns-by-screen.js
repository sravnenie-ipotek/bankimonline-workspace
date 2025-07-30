const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function organizeDropdownsByScreen() {
  try {
    console.log('📊 ORGANIZING DROPDOWNS BY SCREEN LOCATION\n');
    
    // Get all dropdown-related content with better grouping
    const dropdownQuery = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ci.component_type,
        ci.category,
        ct.language_code,
        ct.content_value,
        ct.status
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE ci.component_type IN ('option', 'dropdown', 'select', 'dropdown_option', 'radio')
        AND ci.is_active = true
        AND ct.status = 'approved'
      ORDER BY 
        ci.screen_location,
        CASE 
          WHEN ci.content_key LIKE '%_option_1' THEN 1
          WHEN ci.content_key LIKE '%_option_2' THEN 2
          WHEN ci.content_key LIKE '%_option_3' THEN 3
          WHEN ci.content_key LIKE '%_option_4' THEN 4
          WHEN ci.content_key LIKE '%_option_5' THEN 5
          WHEN ci.content_key LIKE '%_option_6' THEN 6
          WHEN ci.content_key LIKE '%_option_7' THEN 7
          WHEN ci.content_key LIKE '%_option_8' THEN 8
          WHEN ci.content_key LIKE '%_option_9' THEN 9
          ELSE 99
        END,
        ci.content_key,
        ct.language_code
    `);
    
    // Process and organize by screen
    const screenData = {};
    
    dropdownQuery.rows.forEach(row => {
      if (!screenData[row.screen_location]) {
        screenData[row.screen_location] = {
          dropdowns: {},
          totalOptions: new Set(),
          categories: new Set()
        };
      }
      
      // Extract dropdown field name
      const fieldName = extractFieldName(row.content_key);
      
      if (!screenData[row.screen_location].dropdowns[fieldName]) {
        screenData[row.screen_location].dropdowns[fieldName] = {};
      }
      
      if (!screenData[row.screen_location].dropdowns[fieldName][row.content_key]) {
        screenData[row.screen_location].dropdowns[fieldName][row.content_key] = {
          en: null,
          he: null,
          ru: null
        };
        screenData[row.screen_location].totalOptions.add(row.content_key);
      }
      
      screenData[row.screen_location].dropdowns[fieldName][row.content_key][row.language_code] = row.content_value;
      screenData[row.screen_location].categories.add(row.category);
    });
    
    // Generate organized report
    let report = '# DROPDOWN OPTIONS ORGANIZED BY SCREEN LOCATION\n';
    report += '==============================================\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += '## TABLE OF CONTENTS\n\n';
    
    // Create table of contents
    const screens = Object.keys(screenData).sort();
    screens.forEach((screen, index) => {
      const optionCount = screenData[screen].totalOptions.size;
      const dropdownCount = Object.keys(screenData[screen].dropdowns).length;
      report += `${index + 1}. [${screen}](#${screen.toLowerCase().replace(/[_\s]/g, '-')}) - ${dropdownCount} dropdowns, ${optionCount} options\n`;
    });
    
    report += '\n---\n\n';
    
    // Detailed section for each screen
    screens.forEach(screen => {
      const data = screenData[screen];
      report += `## ${screen}\n\n`;
      report += `**Categories**: ${Array.from(data.categories).join(', ') || 'uncategorized'}\n`;
      report += `**Total Dropdowns**: ${Object.keys(data.dropdowns).length}\n`;
      report += `**Total Options**: ${data.totalOptions.size}\n\n`;
      
      // Process each dropdown field
      Object.entries(data.dropdowns).forEach(([fieldName, options]) => {
        report += `### ${fieldName}\n\n`;
        
        // Create a table for this dropdown
        report += '| Option Key | English | Hebrew | Russian |\n';
        report += '|------------|---------|---------|----------|\n';
        
        Object.entries(options).forEach(([key, translations]) => {
          const en = translations.en || '-';
          const he = translations.he || '-';
          const ru = translations.ru || '-';
          report += `| ${key} | ${en} | ${he} | ${ru} |\n`;
        });
        
        report += '\n';
      });
      
      report += '---\n\n';
    });
    
    // Summary statistics
    report += '## SUMMARY STATISTICS\n\n';
    report += `- **Total Screens**: ${screens.length}\n`;
    report += `- **Total Dropdowns**: ${Object.values(screenData).reduce((sum, screen) => sum + Object.keys(screen.dropdowns).length, 0)}\n`;
    report += `- **Total Options**: ${dropdownQuery.rows.filter(row => row.language_code === 'en').length}\n\n`;
    
    // Screen statistics table
    report += '### Options per Screen\n\n';
    report += '| Screen | Dropdowns | Options |\n';
    report += '|--------|-----------|----------|\n';
    screens.forEach(screen => {
      const dropdownCount = Object.keys(screenData[screen].dropdowns).length;
      const optionCount = screenData[screen].totalOptions.size;
      report += `| ${screen} | ${dropdownCount} | ${optionCount} |\n`;
    });
    
    // Write the organized report
    await fs.writeFile('DROPDOWNS_BY_SCREEN.md', report);
    console.log('✅ Report generated: DROPDOWNS_BY_SCREEN.md');
    
    // Also create individual files for each screen
    console.log('\n📁 Creating individual screen files...');
    await fs.mkdir('dropdown_screens', { recursive: true });
    
    for (const screen of screens) {
      let screenReport = `# ${screen} - Dropdown Options\n\n`;
      screenReport += `Generated: ${new Date().toISOString()}\n\n`;
      
      const data = screenData[screen];
      screenReport += `**Categories**: ${Array.from(data.categories).join(', ')}\n`;
      screenReport += `**Total Options**: ${data.totalOptions.size}\n\n`;
      
      Object.entries(data.dropdowns).forEach(([fieldName, options]) => {
        screenReport += `## ${fieldName}\n\n`;
        
        Object.entries(options).forEach(([key, translations]) => {
          screenReport += `### ${key}\n`;
          screenReport += `- **English**: ${translations.en || 'N/A'}\n`;
          screenReport += `- **Hebrew**: ${translations.he || 'N/A'}\n`;
          screenReport += `- **Russian**: ${translations.ru || 'N/A'}\n\n`;
        });
      });
      
      const filename = `dropdown_screens/${screen}.md`;
      await fs.writeFile(filename, screenReport);
      console.log(`  ✅ Created: ${filename}`);
    }
    
    console.log('\n✅ All reports generated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

function extractFieldName(contentKey) {
  // Extract meaningful field name from content key
  const key = contentKey.toLowerCase();
  
  // Remove common prefixes
  let cleaned = key
    .replace(/^app\./, '')
    .replace(/^calculate_/, '')
    .replace(/^refinance_/, '')
    .replace(/^tenders_/, '');
  
  // Extract field name patterns
  if (key.includes('citizenship')) return 'Citizenship';
  if (key.includes('bank') && !key.includes('step')) return 'Bank Selection';
  if (key.includes('property') && key.includes('option')) return 'Property Type';
  if (key.includes('program') && key.includes('option')) return 'Mortgage Program';
  if (key.includes('registered')) return 'Registration Status';
  if (key.includes('why')) return 'Purpose/Reason';
  if (key.includes('debt') && key.includes('type')) return 'Debt Type';
  if (key.includes('employment') || key.includes('source')) return 'Employment Status';
  if (key.includes('additional')) return 'Additional Income';
  if (key.includes('step') && key.includes('title')) return 'Process Steps - Titles';
  if (key.includes('step') && key.includes('desc')) return 'Process Steps - Descriptions';
  
  // For step-based content
  const stepMatch = key.match(/step(\d+)_(title|desc|description)/);
  if (stepMatch) {
    return `Step ${stepMatch[1]} - ${stepMatch[2].charAt(0).toUpperCase() + stepMatch[2].slice(1)}`;
  }
  
  // Default: clean up the key
  return cleaned
    .replace(/_option_\d+$/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

organizeDropdownsByScreen();