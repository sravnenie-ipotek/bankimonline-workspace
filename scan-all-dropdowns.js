const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function scanAllDropdowns() {
  try {
    console.log('🔍 SCANNING ALL DROPDOWNS IN DATABASE\n');
    
    // Get all dropdown-related content
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
      ORDER BY ci.screen_location, ci.content_key, ct.language_code
    `);
    
    // Also get dropdown labels to identify dropdown names
    const labelQuery = await pool.query(`
      SELECT 
        ci.screen_location,
        ci.content_key,
        ct.language_code,
        ct.content_value
      FROM content_items ci
      JOIN content_translations ct ON ci.id = ct.content_item_id
      WHERE (ci.component_type = 'label' OR ci.component_type = 'dropdown_label')
        AND ci.content_key LIKE '%select%' OR ci.content_key LIKE '%dropdown%' 
        OR ci.content_key LIKE '%option%' OR ci.content_key LIKE '%choice%'
        AND ci.is_active = true
        AND ct.status = 'approved'
        AND ct.language_code = 'en'
      ORDER BY ci.screen_location, ci.content_key
    `);
    
    // Process dropdown options
    const dropdownsByScreen = {};
    
    dropdownQuery.rows.forEach(row => {
      if (!dropdownsByScreen[row.screen_location]) {
        dropdownsByScreen[row.screen_location] = {};
      }
      
      // Extract dropdown name from content_key
      const keyParts = row.content_key.split('.');
      const dropdownIdentifier = extractDropdownName(row.content_key);
      
      if (!dropdownsByScreen[row.screen_location][dropdownIdentifier]) {
        dropdownsByScreen[row.screen_location][dropdownIdentifier] = {
          name: dropdownIdentifier,
          options: {},
          category: row.category
        };
      }
      
      if (!dropdownsByScreen[row.screen_location][dropdownIdentifier].options[row.content_key]) {
        dropdownsByScreen[row.screen_location][dropdownIdentifier].options[row.content_key] = {};
      }
      
      dropdownsByScreen[row.screen_location][dropdownIdentifier].options[row.content_key][row.language_code] = row.content_value;
    });
    
    // Generate report
    let report = '# DROPDOWN OPTIONS REPORT\n';
    report += '========================\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Summary
    const totalScreens = Object.keys(dropdownsByScreen).length;
    const totalDropdowns = Object.values(dropdownsByScreen).reduce((sum, screen) => sum + Object.keys(screen).length, 0);
    const totalOptions = dropdownQuery.rows.filter(row => row.language_code === 'en').length;
    
    report += '## SUMMARY\n';
    report += `- Total Screens with Dropdowns: ${totalScreens}\n`;
    report += `- Total Dropdowns: ${totalDropdowns}\n`;
    report += `- Total Options: ${totalOptions}\n\n`;
    
    // Detailed report by screen
    report += '## DROPDOWNS BY SCREEN\n\n';
    
    Object.keys(dropdownsByScreen).sort().forEach(screenLocation => {
      report += `### ${screenLocation}\n`;
      report += '---\n\n';
      
      Object.values(dropdownsByScreen[screenLocation]).forEach(dropdown => {
        report += `**${dropdown.name}** (${dropdown.category || 'uncategorized'})\n\n`;
        
        // Group options by language
        const optionsByLang = { en: [], he: [], ru: [] };
        
        Object.entries(dropdown.options).forEach(([key, translations]) => {
          Object.entries(translations).forEach(([lang, value]) => {
            if (optionsByLang[lang]) {
              optionsByLang[lang].push(`  - ${value} (${key})`);
            }
          });
        });
        
        // Display options by language
        ['en', 'he', 'ru'].forEach(lang => {
          if (optionsByLang[lang].length > 0) {
            const langName = lang === 'en' ? 'English' : lang === 'he' ? 'Hebrew' : 'Russian';
            report += `${langName}:\n`;
            report += optionsByLang[lang].join('\n') + '\n\n';
          }
        });
      });
      
      report += '\n';
    });
    
    // CSV format for easy import
    report += '\n## CSV FORMAT\n\n';
    report += 'screen_location,dropdown_name,option_key,english,hebrew,russian\n';
    
    Object.entries(dropdownsByScreen).forEach(([screen, dropdowns]) => {
      Object.entries(dropdowns).forEach(([dropdownName, dropdown]) => {
        Object.entries(dropdown.options).forEach(([optionKey, translations]) => {
          report += `"${screen}","${dropdownName}","${optionKey}","${translations.en || ''}","${translations.he || ''}","${translations.ru || ''}"\n`;
        });
      });
    });
    
    // Write report to file
    await fs.writeFile('DROPDOWN_OPTIONS_REPORT.md', report);
    console.log('✅ Report generated: DROPDOWN_OPTIONS_REPORT.md');
    
    // Also generate a JSON file for programmatic use
    const jsonReport = {
      generated: new Date().toISOString(),
      summary: {
        totalScreens,
        totalDropdowns,
        totalOptions
      },
      dropdowns: dropdownsByScreen
    };
    
    await fs.writeFile('dropdown_options_report.json', JSON.stringify(jsonReport, null, 2));
    console.log('✅ JSON report generated: dropdown_options_report.json');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

function extractDropdownName(contentKey) {
  // Extract meaningful dropdown name from content key
  // Examples:
  // app.refinance.step1.bank_discount -> bank
  // calculate_mortgage_citizenship_option_1 -> citizenship
  // app.refinance.step1.property_option_1 -> property
  
  const key = contentKey.toLowerCase();
  
  // Common patterns
  if (key.includes('bank') && key.includes('option')) return 'bank_selection';
  if (key.includes('property') && key.includes('option')) return 'property_type';
  if (key.includes('citizenship')) return 'citizenship';
  if (key.includes('program') && key.includes('option')) return 'program_type';
  if (key.includes('registered') && key.includes('option')) return 'registration_status';
  if (key.includes('why') && key.includes('option')) return 'purpose';
  if (key.includes('debt') && key.includes('type')) return 'debt_type';
  if (key.includes('employment') || key.includes('source')) return 'employment_status';
  if (key.includes('additional')) return 'additional_income';
  
  // Extract from pattern like xxx_yyy_option_n
  const match = key.match(/(\w+)_option_\d+$/);
  if (match) return match[1];
  
  // Default: use part before _option
  const parts = key.split('_option');
  if (parts.length > 1) {
    const nameParts = parts[0].split('.');
    return nameParts[nameParts.length - 1];
  }
  
  return contentKey;
}

scanAllDropdowns();