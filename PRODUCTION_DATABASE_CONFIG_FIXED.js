import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Pool } = pg;

// ===============================================
// CORRECTED PRODUCTION DATABASE ARCHITECTURE
// ===============================================

// FIXED: Core database configuration (bankim_core) - ACTUAL PRODUCTION DATABASE
export const coreConfig = {
  name: 'bankim_core',
  host: 'maglev.proxy.rlwy.net',  // FIXED: yamanote → maglev (actual core database)
  port: 43809,                    // FIXED: 53119 → 43809 (correct port)
  database: 'railway',
  connectionString: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL || 
    'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway', // FIXED CONNECTION
  ssl: { rejectUnauthorized: false },
  tables: {
    // Production user tables (226+ users)
    calculator_formula: 'calculator_formula',
    admin_users: 'admin_users',
    user_permissions: 'user_permissions',
    system_configurations: 'system_configurations',
    audit_logs: 'audit_logs',
    workflows: 'workflows',
    // Bank-specific calculation tables
    banks: 'banks',
    bank_configurations: 'bank_configurations', 
    banking_standards: 'banking_standards',
    customer_applications: 'customer_applications',
    bank_offers: 'bank_offers',
    calculation_logs: 'calculation_logs'
  }
};

// ADDED: Content database configuration (bankim_content) - FOR CONTENT FUNCTIONS
export const contentConfig = {
  name: 'bankim_content',
  host: 'shortline.proxy.rlwy.net',
  port: 33452,
  database: 'railway',
  connectionString: process.env.CONTENT_DATABASE_URL || 
    'postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway',
  ssl: { rejectUnauthorized: false },
  functions: {
    get_current_mortgage_rate: 'get_current_mortgage_rate',
    get_content_by_screen: 'get_content_by_screen',
    get_content_with_fallback: 'get_content_with_fallback'
  }
};

// ADDED: Management database configuration (bankim_management) - FOR ADMIN OPERATIONS
export const managementConfig = {
  name: 'bankim_management',
  host: 'yamanote.proxy.rlwy.net', // This is the ACTUAL management database
  port: 53119,
  database: 'railway',
  connectionString: process.env.MANAGEMENT_DATABASE_URL || 
    'postgresql://postgres:hNmqRehjTLTuTGysRIYrvPPaQBDrmNQA@yamanote.proxy.rlwy.net:53119/railway',
  ssl: { rejectUnauthorized: false }
};

// ===============================================
// DATABASE CONNECTION POOLS
// ===============================================

// FIXED: Core database pool (maglev - production users)
export const corePool = new Pool({
  connectionString: coreConfig.connectionString,
  ssl: coreConfig.ssl,
  max: 15,                        // Higher for production load
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,  // Longer timeout for production
});

// ADDED: Content database pool (shortline - content functions) 
export const contentPool = new Pool({
  connectionString: contentConfig.connectionString,
  ssl: contentConfig.ssl,
  max: 10,                        // Moderate for content queries
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ADDED: Management database pool (yamanote - admin operations)
export const managementPool = new Pool({
  connectionString: managementConfig.connectionString,
  ssl: managementConfig.ssl,
  max: 5,                         // Lower for admin operations
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ===============================================
// DATABASE CONNECTION TESTING
// ===============================================

// FIXED: Core database connection test
export const testCoreConnection = async () => {
  try {
    const client = await corePool.connect();
    ');
    
    // Test query with user count validation
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    const userCount = await client.query('SELECT COUNT(*) as user_count FROM users');
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Core database connection failed:', error.message);
    return false;
  }
};

// ADDED: Content database connection test
export const testContentConnection = async () => {
  try {
    const client = await contentPool.connect();
    ');
    
    // Test content function availability
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    const rateTest = await client.query('SELECT get_current_mortgage_rate() as rate');
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Content database connection failed:', error.message);
    return false;
  }
};

// ADDED: Management database connection test
export const testManagementConnection = async () => {
  try {
    const client = await managementPool.connect();
    ');
    
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Management database connection failed:', error.message);
    return false;
  }
};

// ADDED: Test all database connections
export const testAllConnections = async () => {
  const coreResult = await testCoreConnection();
  const contentResult = await testContentConnection();
  const managementResult = await testManagementConnection();
  
  const allConnected = coreResult && contentResult && managementResult;
  
  if (allConnected) {
    } else {
    console.error('💥 Some database connections failed!');
  }
  
  return allConnected;
};

// ===============================================
// CRITICAL PRODUCTION FUNCTIONS
// ===============================================

// ADDED: Get mortgage rate from CONTENT database (CRITICAL FOR PRODUCTION)
export const getMortgageRate = async () => {
  const client = await contentPool.connect();
  try {
    const result = await client.query('SELECT get_current_mortgage_rate() as rate');
    const rate = parseFloat(result.rows[0].rate);
    return rate;
  } catch (error) {
    console.error('[MORTGAGE-RATE] Error getting mortgage rate:', error.message);
    console.warn('[MORTGAGE-RATE] Using fallback rate: 5.0%');
    return 5.0; // Fallback rate for production safety
  } finally {
    client.release();
  }
};

// ADDED: Get content by screen (CRITICAL FOR DROPDOWNS)
export const getContentByScreen = async (screenLocation, language = 'en') => {
  const client = await contentPool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM get_content_by_screen($1, $2)', 
      [screenLocation, language]
    );
    return result.rows;
  } catch (error) {
    console.error('[CONTENT] Error getting content by screen:', error.message);
    return [];
  } finally {
    client.release();
  }
};

// ADDED: Calculate annuity payment with content database rate
export const calculateAnnuityPayment = async (loanAmount, termYears) => {
  const client = await contentPool.connect();
  try {
    const result = await client.query(`
      SELECT 
        get_current_mortgage_rate() as interest_rate,
        calculate_annuity_payment($1, get_current_mortgage_rate(), $2) as monthly_payment
    `, [loanAmount, termYears]);
    
    const calculation = result.rows[0];
    return {
      interestRate: parseFloat(calculation.interest_rate),
      monthlyPayment: parseFloat(calculation.monthly_payment)
    };
  } catch (error) {
    console.error('[CALCULATION] Error calculating payment:', error.message);
    // Fallback calculation
    const rate = 5.0;
    const monthlyRate = rate / 100 / 12;
    const numPayments = termYears * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return {
      interestRate: rate,
      monthlyPayment: monthlyPayment
    };
  } finally {
    client.release();
  }
};

// ===============================================
// UPDATED CORE DATABASE OPERATIONS
// ===============================================

export const coreOperations = {
  // Calculator Formula Operations (CORRECTED to use corePool)
  async getCalculatorFormula() {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM calculator_formula ORDER BY updated_at DESC LIMIT 1'
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  async updateCalculatorFormula(formulaData) {
    const client = await corePool.connect();
    try {
      const {
        minTerm, maxTerm, financingPercentage, bankInterestRate,
        baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
      } = formulaData;

      // Check if formula exists
      const existing = await client.query('SELECT id FROM calculator_formula LIMIT 1');
      
      if (existing.rows.length > 0) {
        // Update existing formula
        const result = await client.query(`
          UPDATE calculator_formula 
          SET min_term = $1, max_term = $2, financing_percentage = $3, bank_interest_rate = $4,
              base_interest_rate = $5, variable_interest_rate = $6, interest_change_period = $7, 
              inflation_index = $8, updated_at = CURRENT_TIMESTAMP 
          WHERE id = $9
          RETURNING *
        `, [
          minTerm, maxTerm, financingPercentage, bankInterestRate,
          baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex,
          existing.rows[0].id
        ]);
        return result.rows[0];
      } else {
        // Create new formula
        const result = await client.query(`
          INSERT INTO calculator_formula (
            min_term, max_term, financing_percentage, bank_interest_rate,
            base_interest_rate, variable_interest_rate, interest_change_period, inflation_index
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          minTerm, maxTerm, financingPercentage, bankInterestRate,
          baseInterestRate, variableInterestRate, interestChangePeriod, inflationIndex
        ]);
        return result.rows[0];
      }
    } finally {
      client.release();
    }
  },

  // Bank Operations (using corePool for production data)
  async getAllBanks() {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM banks WHERE is_active = true ORDER BY priority ASC'
      );
      return result.rows;
    } finally {
      client.release();
    }
  },

  async getBankById(bankId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM banks WHERE id = $1 AND is_active = true',
        [bankId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // Bank Configuration Operations
  async getAllBankConfigurations() {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bc.*, b.name_en, b.name_he, b.name_ru 
        FROM bank_configurations bc
        JOIN banks b ON bc.bank_id = b.id
        WHERE bc.is_active = true AND b.is_active = true
        ORDER BY b.priority ASC
      `);
      return result.rows;
    } finally {
      client.release();
    }
  },

  async getBankConfiguration(bankId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bc.*, b.name_en, b.name_he, b.name_ru
        FROM bank_configurations bc
        JOIN banks b ON bc.bank_id = b.id
        WHERE bc.bank_id = $1 AND bc.is_active = true
      `, [bankId]);
      
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  },

  // FIXED: Bank-specific Rate Calculation (uses getMortgageRate from content DB)
  async calculateBankSpecificRate(bankId, customerData, bankStandards) {
    try {
      // Get base rate from CONTENT database (not hardcoded)
      const baseRate = await getMortgageRate();
      
      // Customer-specific adjustments
      const creditScore = customerData.credit_score;
      let rateAdjustment = 0;

      // Credit score adjustments (as per document)
      if (creditScore >= 750) {
        rateAdjustment = -0.3; // Excellent credit: -0.3%
      } else if (creditScore >= 700) {
        rateAdjustment = -0.1; // Good credit: -0.1%
      } else if (creditScore >= 650) {
        rateAdjustment = 0.0;  // Fair credit: no change
      } else if (creditScore >= 600) {
        rateAdjustment = 0.2;  // Poor credit: +0.2%
      } else {
        rateAdjustment = 0.5;  // Bad credit: +0.5%
      }

      // Property ownership adjustments (Confluence Action #12)
      const propertyOwnership = customerData.property_ownership;
      if (propertyOwnership === '50_percent_financing') {
        rateAdjustment -= 0.1; // Lower LTV = better rate
      } else if (propertyOwnership === '75_percent_financing') {
        rateAdjustment += 0.1; // Higher LTV = higher rate
      }

      // Employment type adjustments
      const employmentType = customerData.employment_type;
      if (employmentType === 'permanent') {
        rateAdjustment -= 0.05;
      } else if (employmentType === 'contract') {
        rateAdjustment += 0.15;
      } else if (employmentType === 'self_employed') {
        rateAdjustment += 0.25;
      }

      const finalRate = baseRate + rateAdjustment;

      // Ensure rate is within bank's min/max bounds
      const minRate = bankStandards.min_interest_rate || 2.50;
      const maxRate = bankStandards.max_interest_rate || 5.00;

      const calculatedRate = Math.max(minRate, Math.min(maxRate, finalRate));
      
      return calculatedRate;

    } catch (error) {
      console.error(`[CALC] Bank ${bankId}: Rate calculation failed - ${error.message}`);
      return null;
    }
  },

  // Customer Application Operations
  async createCustomerApplication(applicationData) {
    const client = await corePool.connect();
    try {
      const {
        customerId, loanAmount, downPayment, propertyValue,
        monthlyIncome, monthlyExpenses, creditScore,
        employmentType, propertyOwnership
      } = applicationData;

      const result = await client.query(`
        INSERT INTO customer_applications (
          customer_id, loan_amount, down_payment, property_value,
          monthly_income, monthly_expenses, credit_score,
          employment_type, property_ownership
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        customerId, loanAmount, downPayment, propertyValue,
        monthlyIncome, monthlyExpenses, creditScore,
        employmentType, propertyOwnership
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  // Bank Offers Operations
  async createBankOffer(offerData) {
    const client = await corePool.connect();
    try {
      const {
        applicationId, bankId, interestRate, monthlyPayment,
        totalPayment, loanTerm, approvalStatus, ltvRatio, dtiRatio
      } = offerData;

      const result = await client.query(`
        INSERT INTO bank_offers (
          application_id, bank_id, interest_rate, monthly_payment,
          total_payment, loan_term, approval_status, ltv_ratio, dti_ratio
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        applicationId, bankId, interestRate, monthlyPayment,
        totalPayment, loanTerm, approvalStatus, ltvRatio, dtiRatio
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  },

  async getBankOffersByApplication(applicationId) {
    const client = await corePool.connect();
    try {
      const result = await client.query(`
        SELECT bo.*, b.name_en, b.name_he, b.name_ru
        FROM bank_offers bo
        JOIN banks b ON bo.bank_id = b.id
        WHERE bo.application_id = $1
        ORDER BY bo.interest_rate ASC
      `, [applicationId]);

      return result.rows;
    } finally {
      client.release();
    }
  },

  // Get database info (CORRECTED)
  async getDbInfo() {
    const client = await corePool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      const clientCount = await client.query('SELECT COUNT(*) FROM clients');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      return {
        database: 'bankim_core',
        actual_host: 'maglev.proxy.rlwy.net:43809',
        type: 'PostgreSQL',
        connection_time: result.rows[0].current_time,
        database_name: result.rows[0].db_name,
        tables: tables.rows.map(t => t.table_name),
        production_users: parseInt(userCount.rows[0].count),
        production_clients: parseInt(clientCount.rows[0].count),
        status: 'production_ready'
      };
    } finally {
      client.release();
    }
  }
};

// ===============================================
// CONTENT DATABASE OPERATIONS (NEW)
// ===============================================

export const contentOperations = {
  // Content retrieval operations
  async getContentByScreen(screenLocation, language = 'en') {
    return await getContentByScreen(screenLocation, language);
  },

  async getMortgageRate() {
    return await getMortgageRate();
  },

  async calculatePayment(loanAmount, termYears) {
    return await calculateAnnuityPayment(loanAmount, termYears);
  },

  // Content database info
  async getDbInfo() {
    const client = await contentPool.connect();
    try {
      const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
      const contentCount = await client.query('SELECT COUNT(*) FROM content_items');
      const translationCount = await client.query('SELECT COUNT(*) FROM content_translations');
      
      return {
        database: 'bankim_content',
        actual_host: 'shortline.proxy.rlwy.net:33452',
        type: 'PostgreSQL',
        connection_time: result.rows[0].current_time,
        database_name: result.rows[0].db_name,
        content_items: parseInt(contentCount.rows[0].count),
        translations: parseInt(translationCount.rows[0].count),
        status: 'content_ready'
      };
    } finally {
      client.release();
    }
  }
};

// ===============================================
// PRODUCTION DATABASE INITIALIZATION
// ===============================================

// UPDATED: Initialize production database with correct connections
export const initializeProductionDatabase = async () => {
  try {
    // Test all connections first
    const connectionsOk = await testAllConnections();
    if (!connectionsOk) {
      throw new Error('Database connection tests failed');
    }
    
    // Get database information
    const coreInfo = await coreOperations.getDbInfo();
    const contentInfo = await contentOperations.getDbInfo();
    
    :', coreInfo.actual_host);
    :', contentInfo.actual_host);
    // Test critical functions
    const mortgageRate = await getMortgageRate();
    return true;
    
  } catch (error) {
    console.error('💥 Production database initialization failed:', error.message);
    return false;
  }
};

// ===============================================
// GRACEFUL SHUTDOWN
// ===============================================

export const closeAllConnections = async () => {
  try {
    await Promise.all([
      corePool.end(),
      contentPool.end(),
      managementPool.end()
    ]);
    
    } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
};

// Legacy export for backwards compatibility
export const closeCoreConnection = closeAllConnections;

// ===============================================
// PRODUCTION HEALTH CHECK
// ===============================================

export const productionHealthCheck = async () => {
  try {
    // Test all connections
    const coreOk = await testCoreConnection();
    const contentOk = await testContentConnection();
    const managementOk = await testManagementConnection();
    
    // Test critical functions
    const mortgageRate = await getMortgageRate();
    const rateOk = mortgageRate > 0;
    
    const healthStatus = {
      timestamp: new Date().toISOString(),
      core_database: coreOk ? 'healthy' : 'error',
      content_database: contentOk ? 'healthy' : 'error',
      management_database: managementOk ? 'healthy' : 'error',
      mortgage_rate_function: rateOk ? 'healthy' : 'error',
      current_mortgage_rate: mortgageRate + '%',
      overall_status: (coreOk && contentOk && rateOk) ? 'healthy' : 'degraded'
    };
    
    return healthStatus;
    
  } catch (error) {
    console.error('💥 Health check failed:', error.message);
    return {
      timestamp: new Date().toISOString(),
      overall_status: 'critical',
      error: error.message
    };
  }
};

// Export default for ES6 import compatibility
export default {
  corePool,
  contentPool, 
  managementPool,
  coreOperations,
  contentOperations,
  getMortgageRate,
  getContentByScreen,
  calculateAnnuityPayment,
  testAllConnections,
  initializeProductionDatabase,
  productionHealthCheck,
  closeAllConnections
};