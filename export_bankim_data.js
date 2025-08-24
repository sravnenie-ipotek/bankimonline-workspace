#!/usr/bin/env node

/**
 * BankIM Comprehensive Data Export Script
 * Exports all content, business rules, user roles, and system data
 * 
 * @author BankIM Development Team
 * @version 1.0
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class BankIMDataExporter {
  constructor() {
    // Content Database (translations and content)
    this.contentPool = new Pool({
      connectionString: process.env.CONTENT_DATABASE_URL || 'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
      ssl: { rejectUnauthorized: false }
    });

    // Main Database (business logic and user data)
    this.mainPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
      ssl: { rejectUnauthorized: false }
    });

    // Management Database (admin and audit data)
    this.managementPool = new Pool({
      connectionString: process.env.MANAGEMENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
      ssl: { rejectUnauthorized: false }
    });

    this.exportDir = `bankim_data_export_${new Date().toISOString().split('T')[0]}`;
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
      
      // Transform to Excel-friendly format
      const contentData = [];
      const contentMap = new Map();
      
      contentResult.rows.forEach(row => {
        const key = `${row.content_key}_${row.language_code}`;
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
      
      return contentData;
    } catch (error) {
      console.error('❌ Error exporting content:', error.message);
      return [];
    }
  }

  async exportBusinessRules() {
    console.log('\n🏦 Exporting Business Rules & Logic...');
    
    try {
      // 1. Banking standards and criteria
      const standardsQuery = `
        SELECT 
          bs.*,
          b.name as bank_name,
          b.code as bank_code
        FROM banking_standards bs
        LEFT JOIN banks b ON bs.bank_id = b.id
        WHERE bs.is_active = true
        ORDER BY b.name, bs.property_type
      `;
      
      const standardsResult = await this.mainPool.query(standardsQuery);
      
      // Export banking standards
      const standardsCSV = this.arrayToCSV(standardsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'banking_standards.csv'), standardsCSV);
      console.log(`✅ Exported ${standardsResult.rows.length} banking standards`);
      
      // 2. Calculation parameters
      const paramsQuery = `
        SELECT 
          p.*,
          pc.name as category_name,
          pc.description as category_description
        FROM params p
        LEFT JOIN param_categories pc ON p.category_id = pc.id
        WHERE p.is_active = true
        ORDER BY pc.name, p.name
      `;
      
      const paramsResult = await this.mainPool.query(paramsQuery);
      
      // Export calculation parameters
      const paramsCSV = this.arrayToCSV(paramsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'calculation_parameters.csv'), paramsCSV);
      console.log(`✅ Exported ${paramsResult.rows.length} calculation parameters`);
      
      return {
        standards: standardsResult.rows,
        parameters: paramsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting business rules:', error.message);
      return { standards: [], parameters: [] };
    }
  }

  async exportUserRolesAndPermissions() {
    console.log('\n👥 Exporting User Roles & Permissions...');
    
    try {
      // 1. User roles and types
      const rolesQuery = `
        SELECT DISTINCT
          role,
          COUNT(*) as user_count,
          MIN(created_at) as first_user,
          MAX(created_at) as last_user
        FROM users
        GROUP BY role
        ORDER BY role
      `;
      
      const rolesResult = await this.mainPool.query(rolesQuery);
      
      // Export user roles
      const rolesCSV = this.arrayToCSV(rolesResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'user_roles.csv'), rolesCSV);
      console.log(`✅ Exported ${rolesResult.rows.length} user roles`);
      
      // 2. User permissions matrix (if exists)
      const permissionsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'clients', 'banks', 'loan_calculations')
        ORDER BY table_name, ordinal_position
      `;
      
      const permissionsResult = await this.mainPool.query(permissionsQuery);
      
      // Export permissions structure
      const permissionsCSV = this.arrayToCSV(permissionsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'database_permissions.csv'), permissionsCSV);
      console.log(`✅ Exported database permissions structure`);
      
      return {
        roles: rolesResult.rows,
        permissions: permissionsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting user roles:', error.message);
      return { roles: [], permissions: [] };
    }
  }

  async exportWorkflowAndStatuses() {
    console.log('\n🔄 Exporting Workflow & Status Data...');
    
    try {
      // 1. Application statuses
      const statusQuery = `
        SELECT DISTINCT
          status,
          COUNT(*) as count,
          MIN(created_at) as first_application,
          MAX(created_at) as last_application
        FROM loan_calculations
        GROUP BY status
        ORDER BY status
      `;
      
      const statusResult = await this.mainPool.query(statusQuery);
      
      // Export statuses
      const statusCSV = this.arrayToCSV(statusResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'application_statuses.csv'), statusCSV);
      console.log(`✅ Exported ${statusResult.rows.length} application statuses`);
      
      // 2. Process types breakdown
      const processQuery = `
        SELECT 
          business_path,
          COUNT(*) as total_applications,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours_to_complete
        FROM loan_calculations
        GROUP BY business_path
        ORDER BY total_applications DESC
      `;
      
      const processResult = await this.mainPool.query(processQuery);
      
      // Export process breakdown
      const processCSV = this.arrayToCSV(processResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'process_breakdown.csv'), processCSV);
      console.log(`✅ Exported process breakdown`);
      
      return {
        statuses: statusResult.rows,
        processes: processResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting workflow data:', error.message);
      return { statuses: [], processes: [] };
    }
  }

  async exportReferenceData() {
    console.log('\n📋 Exporting Reference Data...');
    
    try {
      // 1. Banks and branches
      const banksQuery = `
        SELECT 
          id,
          name,
          code,
          website,
          phone,
          email,
          is_active,
          created_at
        FROM banks
        ORDER BY name
      `;
      
      const banksResult = await this.mainPool.query(banksQuery);
      
      // Export banks
      const banksCSV = this.arrayToCSV(banksResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'banks.csv'), banksCSV);
      console.log(`✅ Exported ${banksResult.rows.length} banks`);
      
      // 2. Document types (if exists)
      const docsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name LIKE '%document%'
        ORDER BY table_name, ordinal_position
      `;
      
      const docsResult = await this.mainPool.query(docsQuery);
      
      // Export document structure
      const docsCSV = this.arrayToCSV(docsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'document_types.csv'), docsCSV);
      console.log(`✅ Exported document types structure`);
      
      return {
        banks: banksResult.rows,
        documents: docsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting reference data:', error.message);
      return { banks: [], documents: [] };
    }
  }

  async exportIntegrationData() {
    console.log('\n🔗 Exporting Integration Data...');
    
    try {
      // 1. External API configurations
      const apiQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%api%' OR table_name LIKE '%integration%' OR table_name LIKE '%external%')
        ORDER BY table_name, ordinal_position
      `;
      
      const apiResult = await this.mainPool.query(apiQuery);
      
      // Export API structure
      const apiCSV = this.arrayToCSV(apiResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'integration_apis.csv'), apiCSV);
      console.log(`✅ Exported integration API structure`);
      
      // 2. System settings
      const settingsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name LIKE '%setting%'
        ORDER BY table_name, ordinal_position
      `;
      
      const settingsResult = await this.mainPool.query(settingsQuery);
      
      // Export settings structure
      const settingsCSV = this.arrayToCSV(settingsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'system_settings.csv'), settingsCSV);
      console.log(`✅ Exported system settings structure`);
      
      return {
        apis: apiResult.rows,
        settings: settingsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting integration data:', error.message);
      return { apis: [], settings: [] };
    }
  }

  async generateSummaryReport() {
    console.log('\n📊 Generating Summary Report...');
    
    try {
      const summary = {
        export_date: new Date().toISOString(),
        database_connections: {
          content_database: process.env.CONTENT_DATABASE_URL ? 'Configured' : 'Missing',
          main_database: process.env.DATABASE_URL ? 'Configured' : 'Missing',
          management_database: process.env.MANAGEMENT_DATABASE_URL ? 'Configured' : 'Missing'
        },
        files_exported: [],
        recommendations: []
      };
      
      // List exported files
      const files = await fs.readdir(this.exportDir);
      summary.files_exported = files;
      
      // Generate recommendations
      summary.recommendations = [
        'Review content_translations.csv for complete translation coverage',
        'Verify banking_standards.csv for current business rules',
        'Check user_roles.csv for permission matrix',
        'Analyze application_statuses.csv for workflow optimization',
        'Review banks.csv for partner institution data'
      ];
      
      await fs.writeFile(
        path.join(this.exportDir, 'export_summary.json'), 
        JSON.stringify(summary, null, 2)
      );
      
      console.log(`✅ Generated summary report: export_summary.json`);
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
    await this.mainPool.end();
    await this.managementPool.end();
    console.log('\n🔒 Database connections closed');
  }

  async runFullExport() {
    console.log('🚀 Starting BankIM Comprehensive Data Export...');
    console.log(`📁 Export directory: ${this.exportDir}`);
    
    try {
      await this.init();
      
      // Run all export functions
      await this.exportContentAndTranslations();
      await this.exportBusinessRules();
      await this.exportUserRolesAndPermissions();
      await this.exportWorkflowAndStatuses();
      await this.exportReferenceData();
      await this.exportIntegrationData();
      
      // Generate summary
      await this.generateSummaryReport();
      
      console.log('\n🎉 Export completed successfully!');
      console.log(`📂 All files saved to: ${this.exportDir}/`);
      console.log('\n📋 Next Steps:');
      console.log('1. Review content_translations.csv for translation completeness');
      console.log('2. Check banking_standards.csv for business rules');
      console.log('3. Analyze user_roles.csv for permission structure');
      console.log('4. Review application_statuses.csv for workflow optimization');
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
    } finally {
      await this.close();
    }
  }
}

// Run the export
if (require.main === module) {
  const exporter = new BankIMDataExporter();
  exporter.runFullExport();
}

module.exports = BankIMDataExporter;
