#!/usr/bin/env node

/**
 * BankIM Business Logic & Admin Data Export Script
 * Exports Main Database (business rules) and Management Database (admin data)
 * 
 * @author BankIM Development Team
 * @version 1.0
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

class BankIMBusinessDataExporter {
  constructor() {
    // Main Database (business logic and user data)
    this.mainPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway',
      ssl: false
    });

    // Management Database (admin and audit data)
    this.managementPool = new Pool({
      connectionString: process.env.MANAGEMENT_DATABASE_URL || 'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
      ssl: false
    });

    this.exportDir = `bankim_business_export_${new Date().toISOString().split('T')[0]}`;
  }

  async init() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
      console.log(`📁 Created export directory: ${this.exportDir}`);
    } catch (error) {
      console.error('❌ Error creating export directory:', error.message);
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
      
      // 3. Interest rate tables
      const ratesQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%rate%' OR table_name LIKE '%interest%' OR table_name LIKE '%loan%')
        ORDER BY table_name, ordinal_position
      `;
      
      const ratesResult = await this.mainPool.query(ratesQuery);
      
      // Export interest rate structure
      const ratesCSV = this.arrayToCSV(ratesResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'interest_rate_structure.csv'), ratesCSV);
      console.log(`✅ Exported interest rate table structure`);
      
      return {
        standards: standardsResult.rows,
        parameters: paramsResult.rows,
        rates: ratesResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting business rules:', error.message);
      return { standards: [], parameters: [], rates: [] };
    }
  }

  async exportApplicationStatuses() {
    console.log('\n🔄 Exporting Application Statuses & Workflows...');
    
    try {
      // 1. Application statuses from loan_calculations
      const statusQuery = `
        SELECT DISTINCT
          status,
          COUNT(*) as count,
          MIN(created_at) as first_application,
          MAX(created_at) as last_application,
          business_path
        FROM loan_calculations
        GROUP BY status, business_path
        ORDER BY business_path, status
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
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
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
      
      // 3. Document verification states
      const docsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%document%' OR table_name LIKE '%verification%' OR table_name LIKE '%approval%')
        ORDER BY table_name, ordinal_position
      `;
      
      const docsResult = await this.mainPool.query(docsQuery);
      
      // Export document structure
      const docsCSV = this.arrayToCSV(docsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'document_verification_structure.csv'), docsCSV);
      console.log(`✅ Exported document verification structure`);
      
      return {
        statuses: statusResult.rows,
        processes: processResult.rows,
        documents: docsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting application statuses:', error.message);
      return { statuses: [], processes: [], documents: [] };
    }
  }

  async exportBankingReferenceData() {
    console.log('\n🏦 Exporting Banking Reference Data...');
    
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
      
      // 2. Product codes and categories
      const productsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%product%' OR table_name LIKE '%category%' OR table_name LIKE '%program%')
        ORDER BY table_name, ordinal_position
      `;
      
      const productsResult = await this.mainPool.query(productsQuery);
      
      // Export product structure
      const productsCSV = this.arrayToCSV(productsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'product_structure.csv'), productsCSV);
      console.log(`✅ Exported product structure`);
      
      // 3. Rejection reason codes
      const rejectionQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%rejection%' OR table_name LIKE '%reason%' OR table_name LIKE '%error%')
        ORDER BY table_name, ordinal_position
      `;
      
      const rejectionResult = await this.mainPool.query(rejectionQuery);
      
      // Export rejection structure
      const rejectionCSV = this.arrayToCSV(rejectionResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'rejection_reasons_structure.csv'), rejectionCSV);
      console.log(`✅ Exported rejection reasons structure`);
      
      return {
        banks: banksResult.rows,
        products: productsResult.rows,
        rejections: rejectionResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting banking reference data:', error.message);
      return { banks: [], products: [], rejections: [] };
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
        AND (table_name LIKE '%api%' OR table_name LIKE '%integration%' OR table_name LIKE '%external%' OR table_name LIKE '%service%')
        ORDER BY table_name, ordinal_position
      `;
      
      const apiResult = await this.mainPool.query(apiQuery);
      
      // Export API structure
      const apiCSV = this.arrayToCSV(apiResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'integration_apis.csv'), apiCSV);
      console.log(`✅ Exported integration API structure`);
      
      // 2. Credit scoring and verification systems
      const scoringQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%credit%' OR table_name LIKE '%scoring%' OR table_name LIKE '%verification%' OR table_name LIKE '%identity%')
        ORDER BY table_name, ordinal_position
      `;
      
      const scoringResult = await this.mainPool.query(scoringQuery);
      
      // Export scoring structure
      const scoringCSV = this.arrayToCSV(scoringResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'credit_scoring_structure.csv'), scoringCSV);
      console.log(`✅ Exported credit scoring structure`);
      
      return {
        apis: apiResult.rows,
        scoring: scoringResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting integration data:', error.message);
      return { apis: [], scoring: [] };
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
      
      // 2. User permissions matrix
      const permissionsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'clients', 'banks', 'loan_calculations', 'banking_standards', 'params')
        ORDER BY table_name, ordinal_position
      `;
      
      const permissionsResult = await this.mainPool.query(permissionsQuery);
      
      // Export permissions structure
      const permissionsCSV = this.arrayToCSV(permissionsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'database_permissions.csv'), permissionsCSV);
      console.log(`✅ Exported database permissions structure`);
      
      // 3. Role-specific actions and workflows
      const actionsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%action%' OR table_name LIKE '%workflow%' OR table_name LIKE '%permission%')
        ORDER BY table_name, ordinal_position
      `;
      
      const actionsResult = await this.mainPool.query(actionsQuery);
      
      // Export actions structure
      const actionsCSV = this.arrayToCSV(actionsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'role_actions_structure.csv'), actionsCSV);
      console.log(`✅ Exported role actions structure`);
      
      return {
        roles: rolesResult.rows,
        permissions: permissionsResult.rows,
        actions: actionsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting user roles:', error.message);
      return { roles: [], permissions: [], actions: [] };
    }
  }

  async exportManagementData() {
    console.log('\n⚙️ Exporting Management Database Data...');
    
    try {
      // 1. Audit logs
      const auditQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%audit%' OR table_name LIKE '%log%' OR table_name LIKE '%history%')
        ORDER BY table_name, ordinal_position
      `;
      
      const auditResult = await this.managementPool.query(auditQuery);
      
      // Export audit structure
      const auditCSV = this.arrayToCSV(auditResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'audit_logs_structure.csv'), auditCSV);
      console.log(`✅ Exported audit logs structure`);
      
      // 2. System settings
      const settingsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%setting%' OR table_name LIKE '%config%' OR table_name LIKE '%admin%')
        ORDER BY table_name, ordinal_position
      `;
      
      const settingsResult = await this.managementPool.query(settingsQuery);
      
      // Export settings structure
      const settingsCSV = this.arrayToCSV(settingsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'system_settings_structure.csv'), settingsCSV);
      console.log(`✅ Exported system settings structure`);
      
      // 3. Performance metrics
      const metricsQuery = `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (table_name LIKE '%metric%' OR table_name LIKE '%performance%' OR table_name LIKE '%analytics%')
        ORDER BY table_name, ordinal_position
      `;
      
      const metricsResult = await this.managementPool.query(metricsQuery);
      
      // Export metrics structure
      const metricsCSV = this.arrayToCSV(metricsResult.rows);
      await fs.writeFile(path.join(this.exportDir, 'performance_metrics_structure.csv'), metricsCSV);
      console.log(`✅ Exported performance metrics structure`);
      
      return {
        audit: auditResult.rows,
        settings: settingsResult.rows,
        metrics: metricsResult.rows
      };
    } catch (error) {
      console.error('❌ Error exporting management data:', error.message);
      return { audit: [], settings: [], metrics: [] };
    }
  }

  async generateBusinessSummary() {
    console.log('\n📊 Generating Business Data Summary...');
    
    try {
      const summary = {
        export_date: new Date().toISOString(),
        database_connections: {
          main_database: process.env.DATABASE_URL ? 'Configured' : 'Missing',
          management_database: process.env.MANAGEMENT_DATABASE_URL ? 'Configured' : 'Missing'
        },
        files_exported: [],
        business_areas_covered: [
          'Banking standards and criteria',
          'Calculation parameters and formulas',
          'Application statuses and workflows',
          'Bank reference data',
          'Integration configurations',
          'User roles and permissions',
          'Audit logs and system settings'
        ],
        recommendations: [
          'Review banking_standards.csv for credit approval criteria',
          'Check calculation_parameters.csv for business formulas',
          'Analyze application_statuses.csv for workflow optimization',
          'Verify banks.csv for partner institution data',
          'Review integration_apis.csv for external system connections',
          'Check user_roles.csv for permission matrix',
          'Analyze audit_logs_structure.csv for compliance requirements'
        ]
      };
      
      // List exported files
      const files = await fs.readdir(this.exportDir);
      summary.files_exported = files;
      
      await fs.writeFile(
        path.join(this.exportDir, 'business_data_summary.json'), 
        JSON.stringify(summary, null, 2)
      );
      
      console.log(`✅ Generated business data summary: business_data_summary.json`);
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
    await this.mainPool.end();
    await this.managementPool.end();
    console.log('\n🔒 Database connections closed');
  }

  async runBusinessExport() {
    console.log('🚀 Starting BankIM Business Data Export...');
    console.log(`📁 Export directory: ${this.exportDir}`);
    
    try {
      await this.init();
      
      // Run all export functions
      await this.exportBusinessRules();
      await this.exportApplicationStatuses();
      await this.exportBankingReferenceData();
      await this.exportIntegrationData();
      await this.exportUserRolesAndPermissions();
      await this.exportManagementData();
      
      // Generate summary
      await this.generateBusinessSummary();
      
      console.log('\n🎉 Business data export completed successfully!');
      console.log(`📂 All files saved to: ${this.exportDir}/`);
      console.log('\n📋 Key Business Data Files:');
      console.log('1. banking_standards.csv - Credit approval criteria');
      console.log('2. calculation_parameters.csv - Business formulas');
      console.log('3. application_statuses.csv - Workflow statuses');
      console.log('4. banks.csv - Partner bank data');
      console.log('5. integration_apis.csv - External system connections');
      console.log('6. user_roles.csv - Permission matrix');
      console.log('7. audit_logs_structure.csv - Compliance data');
      
    } catch (error) {
      console.error('❌ Export failed:', error.message);
    } finally {
      await this.close();
    }
  }
}

// Run the export
if (require.main === module) {
  const exporter = new BankIMBusinessDataExporter();
  exporter.runBusinessExport();
}

module.exports = BankIMBusinessDataExporter;
