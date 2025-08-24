#!/usr/bin/env node

/**
 * BankIM Content & Translation Export Script
 * Focused export of content items and translations from Content Database
 * 
 * @author BankIM Development Team
 * @version 1.0
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class BankIMContentExporter {
  constructor() {
    // Content Database (translations and content)
    this.contentPool = new Pool({
      connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: false // Disable SSL for Railway connection
    });

    this.exportDir = `bankim_content_export_${new Date().toISOString().split('T')[0]}`;
  }

  async init() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
      console.log(`📁 Created export directory: ${this.exportDir}`);
    } catch (error) {
      console.error('❌ Error creating export directory:', error.message);
    }
  }

  async exportContentAndTranslations() {
    console.log('\n📚 Exporting Content & Translations...');
    
    try {
      // 1. Complete content items with translations
      const contentQuery = `
        SELECT 
          ci.id as content_id,
          ci.content_key,
          ci.screen_location,
          ci.component_type,
          ci.category,
          ci.is_active,
          ci.created_at,
          ct.language_code,
          ct.content_value,
          ct.status as translation_status
        FROM content_items ci
        LEFT JOIN content_translations ct ON ci.id = ct.content_item_id
        ORDER BY ci.screen_location, ci.content_key, ct.language_code
      `;
      
      const contentResult = await this.contentPool.query(contentQuery);
      console.log(`📊 Found ${contentResult.rows.length} content records`);
      
      // Transform to Excel-friendly format
      const contentData = [];
      const contentMap = new Map();
      
      contentResult.rows.forEach(row => {
        const key = row.content_key;
        if (!contentMap.has(key)) {
          contentMap.set(key, {
            content_id: row.content_id,
            content_key: row.content_key,
            screen_location: row.screen_location,
            component_type: row.component_type,
            category: row.category,
            is_active: row.is_active,
            created_at: row.created_at,
            english_text: '',
            hebrew_text: '',
            russian_text: '',
            translation_status: ''
          });
        }
        
        const item = contentMap.get(key);
        if (row.language_code === 'en') {
          item.english_text = row.content_value || '';
          item.translation_status = row.translation_status || '';
        } else if (row.language_code === 'he') {
          item.hebrew_text = row.content_value || '';
        } else if (row.language_code === 'ru') {
          item.russian_text = row.content_value || '';
        }
      });
      
      contentData.push(...contentMap.values());
      
      // Export to CSV
      const csvContent = this.arrayToCSV(contentData);
      await fs.writeFile(path.join(this.exportDir, 'content_translations.csv'), csvContent);
      console.log(`✅ Exported ${contentData.length} content items to content_translations.csv`);
      
      // 2. Screen-specific content breakdown
      const screenBreakdown = {};
      contentData.forEach(item => {
        if (!screenBreakdown[item.screen_location]) {
          screenBreakdown[item.screen_location] = [];
        }
        screenBreakdown[item.screen_location].push(item);
      });
      
      await fs.writeFile(
        path.join(this.exportDir, 'content_by_screen.json'), 
        JSON.stringify(screenBreakdown, null, 2)
      );
      console.log(`✅ Exported screen breakdown to content_by_screen.json`);
      
      // 3. Process-specific content (Credit, Mortgage, Refinance)
      const processBreakdown = {
        credit: contentData.filter(item => item.screen_location.includes('credit')),
        mortgage: contentData.filter(item => item.screen_location.includes('mortgage')),
        refinance: contentData.filter(item => item.screen_location.includes('refinance')),
        credit_refi: contentData.filter(item => item.screen_location.includes('credit_refi')),
        home_page: contentData.filter(item => item.screen_location.includes('home')),
        global: contentData.filter(item => !item.screen_location.includes('credit') && 
                                         !item.screen_location.includes('mortgage') && 
                                         !item.screen_location.includes('refinance') &&
                                         !item.screen_location.includes('home'))
      };
      
      await fs.writeFile(
        path.join(this.exportDir, 'content_by_process.json'), 
        JSON.stringify(processBreakdown, null, 2)
      );
      console.log(`✅ Exported process breakdown to content_by_process.json`);
      
      return contentData;
    } catch (error) {
      console.error('❌ Error exporting content:', error.message);
      return [];
    }
  }

  async exportScreenLocations() {
    console.log('\n📍 Exporting Screen Locations...');
    
    try {
      const screenQuery = `
        SELECT DISTINCT
          screen_location,
          COUNT(*) as content_items_count,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_items,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_items
        FROM content_items
        GROUP BY screen_location
        ORDER BY screen_location
      `;
      
      const screenResult = await this.contentPool.query(screenQuery);
      
      // Export screen locations
      const screenCSV = this.arrayToCSV(screenResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'screen_locations.csv'), screenCSV);
      console.log(`✅ Exported ${screenResult.rows.length} screen locations`);
      
      return screenResult.rows;
    } catch (error) {
      console.error('❌ Error exporting screen locations:', error.message);
      return [];
    }
  }

  async exportComponentTypes() {
    console.log('\n🧩 Exporting Component Types...');
    
    try {
      const componentQuery = `
        SELECT DISTINCT
          component_type,
          COUNT(*) as usage_count,
          COUNT(DISTINCT screen_location) as screens_used_in
        FROM content_items
        GROUP BY component_type
        ORDER BY usage_count DESC
      `;
      
      const componentResult = await this.contentPool.query(componentQuery);
      
      // Export component types
      const componentCSV = this.arrayToCSV(componentResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'component_types.csv'), componentCSV);
      console.log(`✅ Exported ${componentResult.rows.length} component types`);
      
      return componentResult.rows;
    } catch (error) {
      console.error('❌ Error exporting component types:', error.message);
      return [];
    }
  }

  async exportTranslationStatus() {
    console.log('\n📊 Exporting Translation Status...');
    
    try {
      const statusQuery = `
        SELECT 
          ct.language_code,
          ct.status,
          COUNT(*) as count,
          COUNT(CASE WHEN ct.content_value IS NULL OR ct.content_value = '' THEN 1 END) as empty_translations
        FROM content_translations ct
        JOIN content_items ci ON ct.content_item_id = ci.id
        GROUP BY ct.language_code, ct.status
        ORDER BY ct.language_code, ct.status
      `;
      
      const statusResult = await this.contentPool.query(statusQuery);
      
      // Export translation status
      const statusCSV = this.arrayToCSV(statusResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'translation_status.csv'), statusCSV);
      console.log(`✅ Exported translation status breakdown`);
      
      return statusResult.rows;
    } catch (error) {
      console.error('❌ Error exporting translation status:', error.message);
      return [];
    }
  }

  async generateContentSummary() {
    console.log('\n📋 Generating Content Summary...');
    
    try {
      // Get overall statistics
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM content_items) as total_content_items,
          (SELECT COUNT(*) FROM content_translations) as total_translations,
          (SELECT COUNT(DISTINCT screen_location) FROM content_items) as unique_screens,
          (SELECT COUNT(DISTINCT component_type) FROM content_items) as unique_component_types,
          (SELECT COUNT(*) FROM content_translations WHERE language_code = 'en') as english_translations,
          (SELECT COUNT(*) FROM content_translations WHERE language_code = 'he') as hebrew_translations,
          (SELECT COUNT(*) FROM content_translations WHERE language_code = 'ru') as russian_translations
      `;
      
      const statsResult = await this.contentPool.query(statsQuery);
      const stats = statsResult.rows[0];
      
      const summary = {
        export_date: new Date().toISOString(),
        database_info: {
          content_database: process.env.CONTENT_DATABASE_URL ? 'Configured' : 'Missing',
          total_content_items: parseInt(stats.total_content_items),
          total_translations: parseInt(stats.total_translations),
          unique_screens: parseInt(stats.unique_screens),
          unique_component_types: parseInt(stats.unique_component_types)
        },
        language_coverage: {
          english: parseInt(stats.english_translations),
          hebrew: parseInt(stats.hebrew_translations),
          russian: parseInt(stats.russian_translations)
        },
        files_exported: [],
        recommendations: [
          'Review content_translations.csv for complete translation coverage',
          'Check content_by_screen.json for screen-specific content',
          'Analyze content_by_process.json for process-specific content',
          'Review translation_status.csv for missing translations',
          'Verify screen_locations.csv for application flow coverage'
        ]
      };
      
      // List exported files
      const files = await fs.readdir(this.exportDir);
      summary.files_exported = files;
      
      await fs.writeFile(
        path.join(this.exportDir, 'content_summary.json'), 
        JSON.stringify(summary, null, 2)
      );
      
      console.log(`✅ Generated content summary: content_summary.json`);
      return summary;
    } catch (error) {
      console.error('❌ Error generating summary:', error.message);
      return {};
    }
  }

  arrayToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  async close() {
    await this.contentPool.end();
    console.log('\n🔒 Database connection closed');
  }

  async runContentExport() {
    console.log('🚀 Starting BankIM Content Export...');
    console.log(`📁 Export directory: ${this.exportDir}`);
    
    try {
      await this.init();
      
      // Run all export functions
      await this.exportContentAndTranslations();
      await this.exportScreenLocations();
      await this.exportComponentTypes();
      await this.exportTranslationStatus();
      
      // Generate summary
      await this.generateContentSummary();
      
      console.log('\n🎉 Content export completed successfully!');
      console.log(`📂 All files saved to: ${this.exportDir}/`);
      console.log('\n📋 Key Files:');
      console.log('1. content_translations.csv - Complete translation matrix');
      console.log('2. content_by_screen.json - Screen-specific content');
      console.log('3. content_by_process.json - Process-specific content');
      console.log('4. translation_status.csv - Translation coverage status');
      console.log('5. content_summary.json - Overall statistics');
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
    } finally {
      await this.close();
    }
  }
}

// Run the export
if (require.main === module) {
  const exporter = new BankIMContentExporter();
  exporter.runContentExport();
}

module.exports = BankIMContentExporter;
