# **DATABASE & BACKEND ARCHITECTURE**
## **Bank-Specific Calculation Parameters System**

### **IMPLEMENTATION BLUEPRINT - BULLETPROOF ARCHITECTURE**
### **🐘 PostgreSQL-Specific Implementation**

---

## **EXISTING SYSTEM ANALYSIS**

### **✅ Already Implemented Tables (PostgreSQL)**
- [x] `banks` - Banks table (referenced in migrations)
- [x] `clients` - Users table with admin roles (migration 001)
- [x] `admin_users` - Multi-role admin system (migration 005)
- [x] `bank_configurations` - Bank-specific configurations (migration 005)
- [x] `banking_standards` - Admin-configurable standards (migration 003)
- [x] `bank_standards_overrides` - Bank-specific overrides (migration 003)
- [x] `calculation_parameters` - Global calculation parameters (migration 002)
- [x] `bank_employee_sessions` - Bank worker sessions (migration 011)
- [x] `bank_branches` - Bank branches (migration 011)

### **✅ Already Implemented APIs**
- [x] `/api/admin/calculations` - Global calculation parameters management
- [x] `/api/admin/calculate-enhanced-mortgage` - Enhanced mortgage calculations
- [x] `/api/admin/banking-standards/:business_path` - Banking standards management
- [x] `/api/customer/compare-banks` - Multi-bank comparison with overrides
- [x] `/api/admin/banks/:id/config` - Bank configuration management

---

## **1. DATABASE ARCHITECTURE - PostgreSQL**

### **1.1 Enhanced Database Schema (Building on Existing)**

#### **NEW Primary Tables Structure**

**`bank_calculation_parameters`** (NEW - Extends existing `calculation_parameters`)

```sql
-- PostgreSQL-specific table creation
CREATE TABLE bank_calculation_parameters (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
    parameter_category VARCHAR(50) NOT NULL CHECK (parameter_category IN ('mortgage', 'credit', 'refinance', 'general')),
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value DECIMAL(15,6) NOT NULL,
    parameter_type VARCHAR(20) NOT NULL CHECK (parameter_type IN ('rate', 'percentage', 'amount', 'ratio', 'years', 'boolean')),
    min_value DECIMAL(15,6),
    max_value DECIMAL(15,6),
    default_value DECIMAL(15,6),
    is_active BOOLEAN DEFAULT TRUE,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES admin_users(id), -- Uses existing admin_users table
    updated_by INTEGER NOT NULL REFERENCES admin_users(id),
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    UNIQUE(bank_id, parameter_category, parameter_name, effective_date)
);

-- PostgreSQL-specific indexes
CREATE INDEX idx_bank_calc_params_bank_category ON bank_calculation_parameters(bank_id, parameter_category);
CREATE INDEX idx_bank_calc_params_effective_date ON bank_calculation_parameters(effective_date) WHERE is_active = TRUE;
CREATE INDEX idx_bank_calc_params_lookup ON bank_calculation_parameters(bank_id, parameter_name, is_active, effective_date);
CREATE INDEX idx_bank_calc_params_active ON bank_calculation_parameters(bank_id, parameter_category, parameter_name) WHERE is_active = TRUE;
CREATE INDEX idx_bank_calc_params_jsonb ON bank_calculation_parameters USING GIN (metadata);
```

**`bank_calculation_parameter_audit`** (NEW - Extends existing `banking_standards_history`)

```sql
-- PostgreSQL-specific audit table
CREATE TABLE bank_calculation_parameter_audit (
    id SERIAL PRIMARY KEY,
    parameter_id INTEGER NOT NULL REFERENCES bank_calculation_parameters(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_value JSONB,
    new_value JSONB,
    changed_by INTEGER NOT NULL REFERENCES admin_users(id), -- Uses existing admin_users table
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255)
);

-- PostgreSQL-specific audit indexes
CREATE INDEX idx_bank_param_audit_parameter_id ON bank_calculation_parameter_audit(parameter_id);
CREATE INDEX idx_bank_param_audit_changed_at ON bank_calculation_parameter_audit(changed_at);
CREATE INDEX idx_bank_param_audit_changed_by ON bank_calculation_parameter_audit(changed_by);
CREATE INDEX idx_bank_param_audit_jsonb_old ON bank_calculation_parameter_audit USING GIN (old_value);
CREATE INDEX idx_bank_param_audit_jsonb_new ON bank_calculation_parameter_audit USING GIN (new_value);
```

**`bank_calculation_formulas`** (NEW - Dynamic formula engine)

```sql
-- PostgreSQL-specific formulas table
CREATE TABLE bank_calculation_formulas (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES banks(id),
    formula_type VARCHAR(50) NOT NULL CHECK (formula_type IN ('mortgage_payment', 'credit_score_adjustment', 'ltv_calculation', 'dti_calculation')),
    formula_name VARCHAR(100) NOT NULL,
    formula_expression TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES admin_users(id), -- Uses existing admin_users table
    UNIQUE(bank_id, formula_type, formula_name)
);

-- PostgreSQL-specific formula indexes
CREATE INDEX idx_bank_formulas_bank_type ON bank_calculation_formulas(bank_id, formula_type);
CREATE INDEX idx_bank_formulas_active ON bank_calculation_formulas(bank_id, is_active);
```

**`bank_parameter_templates`** (NEW - Template management)

```sql
-- PostgreSQL-specific templates table
CREATE TABLE bank_parameter_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_description TEXT,
    parameter_config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL REFERENCES admin_users(id) -- Uses existing admin_users table
);

-- PostgreSQL-specific template indexes
CREATE INDEX idx_bank_templates_name ON bank_parameter_templates(template_name);
CREATE INDEX idx_bank_templates_default ON bank_parameter_templates(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_bank_templates_jsonb ON bank_parameter_templates USING GIN (parameter_config);
```

### **1.2 Security & Access Control Schema (PostgreSQL)**

**`bank_parameter_permissions`**
```sql
-- PostgreSQL-specific permissions table
CREATE TABLE bank_parameter_permissions (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES banks(id),
    user_id INTEGER NOT NULL REFERENCES admin_users(id),
    permission_type VARCHAR(50) NOT NULL CHECK (permission_type IN ('read', 'write', 'admin')),
    parameter_category VARCHAR(50),
    granted_by INTEGER NOT NULL REFERENCES admin_users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(bank_id, user_id, permission_type, parameter_category)
);

-- PostgreSQL-specific permission indexes
CREATE INDEX idx_bank_param_permissions_lookup ON bank_parameter_permissions(bank_id, user_id, is_active);
CREATE INDEX idx_bank_param_permissions_expires ON bank_parameter_permissions(expires_at) WHERE expires_at IS NOT NULL;
```

**`bank_parameter_access_log`**
```sql
-- PostgreSQL-specific access log table
CREATE TABLE bank_parameter_access_log (
    id SERIAL PRIMARY KEY,
    bank_id INTEGER NOT NULL REFERENCES banks(id),
    user_id INTEGER NOT NULL REFERENCES admin_users(id),
    action VARCHAR(50) NOT NULL,
    parameter_id INTEGER REFERENCES bank_calculation_parameters(id),
    access_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT
);

-- PostgreSQL-specific access log indexes
CREATE INDEX idx_bank_param_access_log_lookup ON bank_parameter_access_log(bank_id, user_id, access_time);
CREATE INDEX idx_bank_param_access_log_time ON bank_parameter_access_log(access_time);
CREATE INDEX idx_bank_param_access_log_ip ON bank_parameter_access_log(ip_address);
```

### **1.3 PostgreSQL-Specific Features**

#### **Audit Triggers (PostgreSQL)**
```sql
-- PostgreSQL-specific audit trigger function
CREATE OR REPLACE FUNCTION bank_parameter_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO bank_calculation_parameter_audit(parameter_id, action, old_value, changed_by, changed_at)
        VALUES (OLD.id, 'DELETE', row_to_json(OLD), OLD.updated_by, NOW());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO bank_calculation_parameter_audit(parameter_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.updated_by, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO bank_calculation_parameter_audit(parameter_id, action, new_value, changed_by, changed_at)
        VALUES (NEW.id, 'INSERT', row_to_json(NEW), NEW.created_by, NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER bank_parameter_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON bank_calculation_parameters
    FOR EACH ROW EXECUTE FUNCTION bank_parameter_audit_trigger();
```

#### **Parameter Lookup Functions (PostgreSQL)**
```sql
-- PostgreSQL-specific lookup function
CREATE OR REPLACE FUNCTION get_bank_parameter_value(
    p_bank_id INTEGER,
    p_parameter_name VARCHAR(100),
    p_effective_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) RETURNS DECIMAL(15,6) AS $$
DECLARE
    param_value DECIMAL(15,6);
BEGIN
    SELECT parameter_value INTO param_value
    FROM bank_calculation_parameters
    WHERE bank_id = p_bank_id
      AND parameter_name = p_parameter_name
      AND is_active = TRUE
      AND effective_date <= p_effective_date
      AND (expiry_date IS NULL OR expiry_date > p_effective_date)
    ORDER BY effective_date DESC
    LIMIT 1;
    
    RETURN param_value;
END;
$$ LANGUAGE plpgsql;

-- PostgreSQL-specific batch lookup function
CREATE OR REPLACE FUNCTION get_bank_parameters_json(
    p_bank_id INTEGER,
    p_category VARCHAR(50) DEFAULT NULL,
    p_effective_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_object_agg(parameter_name, parameter_value) INTO result
    FROM bank_calculation_parameters
    WHERE bank_id = p_bank_id
      AND (p_category IS NULL OR parameter_category = p_category)
      AND is_active = TRUE
      AND effective_date <= p_effective_date
      AND (expiry_date IS NULL OR expiry_date > p_effective_date);
    
    RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;
```

---

## **2. BACKEND API ARCHITECTURE**

### **2.1 Core API Structure**

#### **Parameter Management Endpoints**

**Base URL Pattern:** `/api/v1/banks/{bank_id}/calculation-parameters`

**Security Layer:** JWT + Role-Based Access Control (RBAC)

#### **Endpoint Structure**

```javascript
// GET /api/v1/banks/{bank_id}/calculation-parameters
// Query parameters: category, active, effective_date, version
app.get('/api/v1/banks/:bank_id/calculation-parameters', [
    authenticateToken,
    validateBankAccess,
    checkParameterPermission('read')
], getCalculationParameters);

// POST /api/v1/banks/{bank_id}/calculation-parameters
app.post('/api/v1/banks/:bank_id/calculation-parameters', [
    authenticateToken,
    validateBankAccess,
    checkParameterPermission('write'),
    validateParameterData
], createCalculationParameter);

// PUT /api/v1/banks/{bank_id}/calculation-parameters/{param_id}
app.put('/api/v1/banks/:bank_id/calculation-parameters/:param_id', [
    authenticateToken,
    validateBankAccess,
    checkParameterPermission('write'),
    validateParameterData,
    checkParameterOwnership
], updateCalculationParameter);

// DELETE /api/v1/banks/{bank_id}/calculation-parameters/{param_id}
app.delete('/api/v1/banks/:bank_id/calculation-parameters/:param_id', [
    authenticateToken,
    validateBankAccess,
    checkParameterPermission('admin'),
    checkParameterOwnership
], deleteCalculationParameter);
```

### **2.2 Security Implementation**

#### **Authentication & Authorization Middleware**

```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
    // JWT token validation
    // Rate limiting
    // IP whitelisting for admin operations
    // Session management
};

// Bank access validation
const validateBankAccess = async (req, res, next) => {
    // Verify user has access to specific bank
    // Check user's bank association
    // Validate bank status (active/suspended)
};

// Permission checking
const checkParameterPermission = (required_permission) => {
    return async (req, res, next) => {
        // Check user permissions for specific bank and parameter category
        // Verify permission expiry
        // Log access attempt
    };
};
```

#### **Data Validation & Sanitization**

```javascript
const validateParameterData = (req, res, next) => {
    // Input sanitization
    // Parameter value range validation
    // Data type validation
    // Business rule validation
    // SQL injection prevention
};
```

### **2.3 Parameter Calculation Engine**

#### **Dynamic Parameter Resolver**

```javascript
class BankParameterResolver {
    async getParameterValue(bankId, parameterName, effectiveDate = new Date()) {
        // Cache lookup first
        // Database query with version control
        // Default value fallback
        // Parameter inheritance logic
    }
    
    async calculateMortgagePayment(bankId, loanAmount, termYears, applicantData) {
        // Fetch bank-specific parameters
        // Apply dynamic formulas
        // Calculate with risk adjustments
        // Return detailed calculation breakdown
    }
    
    async validateParameterChange(bankId, parameterName, newValue, userId) {
        // Business rule validation
        // Impact analysis
        // Approval workflow trigger
        // Audit trail creation
    }
}
```

### **2.4 Caching Strategy**

#### **Multi-Level Caching Implementation**

**Level 1: Redis Cache**
```javascript
// Parameter cache with TTL
const cacheKey = `bank_params:${bankId}:${category}:${version}`;
const cacheTTL = 3600; // 1 hour

// Cache invalidation on parameter update
const invalidateParameterCache = async (bankId, category) => {
    await redisClient.del(`bank_params:${bankId}:${category}:*`);
};
```

**Level 2: Application Memory Cache**
```javascript
// In-memory cache for frequently accessed parameters
const parameterCache = new Map();
const cacheRefreshInterval = 300000; // 5 minutes
```

---

## **3. SECURITY IMPLEMENTATION**

### **3.1 Access Control Matrix**

| Role | Read Parameters | Write Parameters | Admin Parameters | Audit Access |
|------|----------------|------------------|------------------|--------------|
| Bank Admin | ✅ All | ✅ All | ✅ All | ✅ Full |
| Bank Manager | ✅ All | ✅ Limited | ❌ No | ✅ Limited |
| Bank Employee | ✅ Limited | ❌ No | ❌ No | ❌ No |
| System Admin | ✅ All Banks | ✅ All Banks | ✅ All Banks | ✅ Full |

### **3.2 Security Measures**

#### **Data Protection**
- Parameter values encrypted at rest
- TLS 1.3 for data in transit
- Field-level encryption for sensitive parameters
- Regular security audits

#### **Access Control**
- Multi-factor authentication for admin operations
- IP whitelisting for parameter modifications
- Session timeout enforcement
- Concurrent session limits

#### **Audit & Monitoring**
- Real-time parameter change notifications
- Suspicious activity detection
- Automated security alerts
- Compliance reporting

### **3.3 Approval Workflow**

#### **Parameter Change Approval Process**
1. **Submission**: User submits parameter change request
2. **Validation**: System validates business rules and constraints
3. **Approval**: Manager/Admin approves significant changes
4. **Staging**: Changes deployed to staging environment
5. **Testing**: Automated tests validate calculation accuracy
6. **Production**: Changes deployed to production with rollback capability

---

## **4. CALCULATION ENGINE ARCHITECTURE**

### **4.1 Dynamic Formula Engine**

#### **Formula Parser & Executor**
```javascript
class FormulaEngine {
    parseFormula(formulaExpression, parameters) {
        // Parse mathematical expressions
        // Validate parameter references
        // Generate executable function
        // Cache compiled formulas
    }
    
    executeCalculation(formulaId, inputData, bankId) {
        // Retrieve bank-specific parameters
        // Apply formula with parameter substitution
        // Handle edge cases and errors
        // Return detailed calculation results
    }
}
```

### **4.2 Risk Assessment Integration**

#### **Dynamic Risk Scoring**
- Credit score impact calculations
- LTV ratio adjustments
- DTI ratio validations
- Regional risk factors
- Market condition adjustments

### **4.3 Performance Optimization**

#### **Calculation Caching**
- Pre-computed calculation tables
- Parameter combination caching
- Result memoization
- Batch calculation processing

---

## **5. MIGRATION & DEPLOYMENT STRATEGY**

### **5.1 Migration Plan**

#### **Phase 1: Database Schema Deployment**
1. Create new tables with proper indexes
2. Migrate existing calculation_parameters data
3. Establish bank-parameter relationships
4. Create default parameter sets

#### **Phase 2: API Implementation**
1. Deploy new parameter management endpoints
2. Update calculation endpoints to use bank-specific parameters
3. Implement caching layer
4. Deploy security middleware

#### **Phase 3: Frontend Integration**
1. Update admin panel for parameter management
2. Modify calculation forms to use dynamic parameters
3. Implement approval workflows
4. Add audit trail viewing

### **5.2 Rollback Strategy**

#### **Safe Deployment Approach**
- Blue-green deployment for zero downtime
- Database migration rollback scripts
- Parameter versioning for safe rollbacks
- Automated testing validation

---

## **6. MONITORING & MAINTENANCE**

### **6.1 Performance Monitoring**

#### **Key Metrics**
- Parameter lookup response times
- Calculation accuracy validation
- Cache hit rates
- API endpoint performance
- Database query optimization

### **6.2 Operational Procedures**

#### **Regular Maintenance Tasks**
- Parameter audit reviews
- Performance optimization
- Security vulnerability assessments
- Backup and disaster recovery testing
- Compliance validation

#### **Alerting System**
- Parameter change notifications
- Calculation error alerts
- Performance degradation warnings
- Security breach detection
- System health monitoring

---

## **7. COMPLIANCE & GOVERNANCE**

### **7.1 Regulatory Compliance**

#### **Financial Regulations**
- Parameter change documentation
- Calculation transparency requirements
- Audit trail preservation
- Risk assessment validation
- Regulatory reporting capabilities

### **7.2 Data Governance**

#### **Data Quality Assurance**
- Parameter value validation rules
- Calculation accuracy testing
- Data integrity checks
- Regular compliance audits
- Change management procedures

---

## **8. IMPLEMENTATION CHECKLIST**

### **8.1 Pre-Implementation Requirements**
- [ ] Database backup and recovery plan
- [ ] Security assessment and approval
- [ ] Performance baseline establishment
- [ ] Compliance review completion
- [ ] Testing environment setup

### **8.2 Implementation Steps**
- [ ] Deploy database schema changes
- [ ] Implement security middleware
- [ ] Deploy API endpoints
- [ ] Update calculation engine
- [ ] Deploy caching layer
- [ ] Update frontend components
- [ ] Conduct integration testing
- [ ] Deploy monitoring systems
- [ ] Perform security testing
- [ ] Complete user training

### **8.3 Post-Implementation Validation**
- [ ] Calculation accuracy verification
- [ ] Performance benchmarking
- [ ] Security penetration testing
- [ ] User acceptance testing
- [ ] Compliance validation
- [ ] Documentation completion

---

## **CONCLUSION**

This architecture provides a robust, secure, and scalable solution for bank-specific calculation parameters. The implementation ensures data integrity, regulatory compliance, and optimal performance while maintaining flexibility for future enhancements.

**Key Benefits:**
- **Security**: Multi-layered security with comprehensive audit trails
- **Scalability**: Efficient caching and database optimization
- **Flexibility**: Dynamic formula engine with versioning support
- **Compliance**: Built-in regulatory compliance and governance features
- **Performance**: Optimized for high-frequency calculations with minimal latency

**Implementation Timeline:** 8-12 weeks for full deployment with comprehensive testing and validation.

---

## **CRITICAL FIXES FOR EXISTING SYSTEM**

### **🔧 Required PostgreSQL Database Changes**

**1. Fix Table References to Use Existing Admin System:**

```sql
-- Fix bank_calculation_parameter_audit table references
ALTER TABLE bank_calculation_parameter_audit 
    DROP CONSTRAINT IF EXISTS bank_calculation_parameter_audit_changed_by_fkey,
    ADD CONSTRAINT bank_calculation_parameter_audit_changed_by_fkey 
    FOREIGN KEY (changed_by) REFERENCES admin_users(id);

-- Fix bank_calculation_formulas table references
ALTER TABLE bank_calculation_formulas 
    DROP CONSTRAINT IF EXISTS bank_calculation_formulas_created_by_fkey,
    ADD CONSTRAINT bank_calculation_formulas_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES admin_users(id);

-- Fix bank_parameter_templates table references
ALTER TABLE bank_parameter_templates 
    DROP CONSTRAINT IF EXISTS bank_parameter_templates_created_by_fkey,
    ADD CONSTRAINT bank_parameter_templates_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES admin_users(id);

-- Fix bank_parameter_permissions table references
ALTER TABLE bank_parameter_permissions 
    DROP CONSTRAINT IF EXISTS bank_parameter_permissions_user_id_fkey,
    ADD CONSTRAINT bank_parameter_permissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES admin_users(id);

-- Fix bank_parameter_access_log table references
ALTER TABLE bank_parameter_access_log 
    DROP CONSTRAINT IF EXISTS bank_parameter_access_log_user_id_fkey,
    ADD CONSTRAINT bank_parameter_access_log_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES admin_users(id);
```

**2. Replace Hardcoded Values in Existing Code:**
```javascript
// Current issue in server-db.js line 5075 - HARDCODED VALUES
const standards = {
    ltv_standard_ltv_max: 80,              // ❌ HARDCODED
    dti_back_end_dti_max: 42,              // ❌ HARDCODED
    // ... etc
};

// SOLUTION: Replace with PostgreSQL database lookup
const getBankCalculationParameters = async (bankId, category) => {
    const result = await pool.query(`
        SELECT parameter_name, parameter_value, parameter_type
        FROM bank_calculation_parameters 
        WHERE bank_id = $1 AND parameter_category = $2 AND is_active = TRUE
        AND (effective_date <= NOW() AND (expiry_date IS NULL OR expiry_date > NOW()))
        ORDER BY effective_date DESC
    `, [bankId, category]);
    
    const parameters = {};
    result.rows.forEach(row => {
        parameters[row.parameter_name] = parseFloat(row.parameter_value);
    });
    return parameters;
};
```

**3. Fix API Endpoints to Use Bank-Specific Parameters:**

```javascript
// Update calculateEnhancedMortgage function (line 5046)
async function calculateEnhancedMortgage(params) {
    const { bankId, ...otherParams } = params;
    
    // Replace hardcoded standards with PostgreSQL database lookup
    const standards = await getBankCalculationParameters(bankId, 'mortgage');
    
    // Use bank-specific parameters in calculations
    const ltv_max = standards.ltv_standard_ltv_max || 80; // Fallback to default
    const dti_max = standards.dti_back_end_dti_max || 42;
    // ... etc
}
```

### **🚨 URGENT: Current System Issues**

**1. Calculation Inconsistency:**
- Admin panel changes banking standards ✅
- Customer calculations use hardcoded values ❌
- **Result:** Admin changes have NO EFFECT on customer calculations

**2. Missing Bank-Specific Parameters:**
- Current system: Global parameters only
- Needed: Each bank has its own calculation parameters
- **Result:** All banks use same calculation logic

**3. No Parameter Audit Trail:**
- Current system: Basic change tracking
- Needed: Comprehensive audit with IP, user, reason
- **Result:** Compliance issues for financial regulations

### **🔧 Implementation Priority**

**Phase 1 (Critical - 2 weeks):**
- [ ] **Fix hardcoded values** in server-db.js (line 5075)
- [ ] **Update API endpoints** to use bank-specific parameters
- [ ] **Migrate existing data** from calculation_parameters to bank_calculation_parameters
- [ ] **Test critical calculations** with real bank data

**Phase 2 (High Priority - 4 weeks):**
- [ ] **Implement bank-specific parameter management UI** in admin panel
- [ ] **Add parameter audit system** with comprehensive logging
- [ ] **Create migration tools** for existing data
- [ ] **Add parameter validation** and business rules

**Phase 3 (Medium Priority - 6 weeks):**
- [ ] **Implement formula engine** for dynamic calculations
- [ ] **Add approval workflows** for parameter changes
- [ ] **Create monitoring and alerting** system
- [ ] **Add performance optimization** features

---

## **MIGRATION STRATEGY FROM CURRENT SYSTEM**

### **Step 1: PostgreSQL Database Migration**

```sql
-- Create new bank_calculation_parameters table
-- Migrate data from existing calculation_parameters using PostgreSQL-specific syntax
INSERT INTO bank_calculation_parameters (bank_id, parameter_name, parameter_value, parameter_type, parameter_category, created_by, updated_by)
SELECT b.id, cp.parameter_name, cp.parameter_value, cp.parameter_type, 'general', 1, 1
FROM banks b
CROSS JOIN calculation_parameters cp
WHERE b.tender = 1; -- Only active banks

-- Create PostgreSQL-specific backup
CREATE TABLE calculation_parameters_backup AS SELECT * FROM calculation_parameters;
```

### **Step 2: Code Migration**

### **Step 3: Testing & Validation**

This architecture addresses the critical issues identified in the current system while building on existing infrastructure.

---

## **📋 MASTER IMPLEMENTATION CHECKLIST - ORGANIZED BY SECTIONS**

### **SECTION 1: 🔴 CRITICAL FIXES (Week 1-2)**

#### **1.1 Database Critical Fixes**
- [ ] **Fix hardcoded values in server-db.js** (Line 5075 - URGENT)
- [ ] **Create getBankCalculationParameters function** for PostgreSQL lookup
- [ ] **Update calculateEnhancedMortgage** to use bank-specific parameters
- [ ] **Update calculateEnhancedCredit** to use bank-specific parameters

#### **1.2 API Critical Fixes**
- [ ] **Test admin panel parameter changes** affect customer calculations
- [ ] **Verify customer/compare-banks endpoint** uses bank-specific data

---

### **SECTION 2: 🟡 DATABASE IMPLEMENTATION (Week 2-4)**

#### **2.1 PostgreSQL Table Creation**
- [ ] **Create bank_calculation_parameters table** with proper PostgreSQL schema
- [ ] **Create bank_calculation_parameter_audit table** for audit trail
- [ ] **Create bank_calculation_formulas table** for dynamic formulas
- [ ] **Create bank_parameter_templates table** for parameter templates

#### **2.2 PostgreSQL Access Control Tables**
- [ ] **Create bank_parameter_permissions table** for access control
- [ ] **Create bank_parameter_access_log table** for security logging

#### **2.3 PostgreSQL Optimization**
- [ ] **Add all required indexes** for performance optimization
- [ ] **Set up PostgreSQL audit triggers** for automatic parameter change logging

#### **2.4 Data Migration**
- [ ] **Migrate existing data** from calculation_parameters table
- [ ] **Test all PostgreSQL database constraints** and foreign keys

---

### **SECTION 3: 🟢 API DEVELOPMENT (Week 3-5)**

#### **3.1 REST API Endpoints**
- [ ] **Create GET /api/v1/banks/{bank_id}/calculation-parameters** endpoint
- [ ] **Create POST /api/v1/banks/{bank_id}/calculation-parameters** endpoint
- [ ] **Create PUT /api/v1/banks/{bank_id}/calculation-parameters/{param_id}** endpoint
- [ ] **Create DELETE /api/v1/banks/{bank_id}/calculation-parameters/{param_id}** endpoint

#### **3.2 Authentication & Authorization**
- [ ] **Implement JWT authentication** middleware
- [ ] **Add role-based access control** (RBAC) system
- [ ] **Create parameter validation** middleware

#### **3.3 Advanced Features**
- [ ] **Add parameter versioning** support
- [ ] **Implement caching layer** (Redis + Memory)
- [ ] **Test all API endpoints** with security validation

---

### **SECTION 4: 🔵 ADMIN PANEL UI (Week 4-6)**

#### **4.1 Parameter Management Interface**
- [ ] **Create bank parameter management** interface
- [ ] **Add parameter creation** forms with validation
- [ ] **Add parameter editing** interface with history

#### **4.2 Audit and Templates**
- [ ] **Create parameter audit trail** viewer
- [ ] **Add parameter templates** management
- [ ] **Implement approval workflows** for parameter changes

#### **4.3 Advanced UI Features**
- [ ] **Add bulk parameter operations** (export/import)
- [ ] **Create parameter comparison** tools between banks
- [ ] **Add parameter impact analysis** before changes
- [ ] **Test complete admin workflow** end-to-end

---

### **SECTION 5: 🟣 SECURITY & COMPLIANCE (Week 5-7)**

#### **5.1 Audit & Logging**
- [ ] **Implement comprehensive audit logging** with IP tracking
- [ ] **Add parameter change notifications** to relevant users
- [ ] **Create security access controls** for parameter categories

#### **5.2 Data Protection**
- [ ] **Add parameter encryption** for sensitive values
- [ ] **Implement session management** for parameter changes
- [ ] **Create compliance reports** for parameter changes

#### **5.3 Security Testing**
- [ ] **Add automated security alerts** for suspicious activities
- [ ] **Conduct security penetration testing** on parameter system
- [ ] **Document security procedures** for parameter management
- [ ] **Train admin users** on security best practices

---

### **SECTION 6: 🔶 PERFORMANCE & MONITORING (Week 6-8)**

#### **6.1 Performance Optimization**
- [ ] **Implement multi-level caching** strategy
- [ ] **Add parameter lookup optimization** with PostgreSQL indexes
- [ ] **Create performance monitoring** dashboard

#### **6.2 Monitoring & Analytics**
- [ ] **Add parameter change impact** tracking
- [ ] **Implement automated alerts** for performance issues
- [ ] **Create parameter usage analytics**

#### **6.3 Load Testing**
- [ ] **Add load testing** for parameter-heavy calculations
- [ ] **Optimize PostgreSQL queries** for parameter lookups
- [ ] **Monitor calculation response times** across all banks
- [ ] **Set up automated backups** for parameter data

---

### **SECTION 7: 🟠 TESTING & VALIDATION (Week 7-8)**

#### **7.1 Unit & Integration Testing**
- [ ] **Create unit tests** for all parameter functions
- [ ] **Add integration tests** for parameter API endpoints
- [ ] **Create end-to-end tests** for complete workflow

#### **7.2 Data Validation**
- [ ] **Test parameter migration** with production data
- [ ] **Validate calculation accuracy** with bank-specific parameters
- [ ] **Test audit trail completeness**

#### **7.3 System Testing**
- [ ] **Verify security access controls** work correctly
- [ ] **Test performance** under high load
- [ ] **Validate compliance** with banking regulations
- [ ] **User acceptance testing** with admin users

---

### **SECTION 8: ✅ DEPLOYMENT & ROLLOUT (Week 8)**

#### **8.1 Pre-Deployment**
- [ ] **Prepare production deployment** scripts
- [ ] **Create rollback procedures** for emergency situations
- [ ] **Deploy PostgreSQL database changes** with proper backups

#### **8.2 Deployment**
- [ ] **Deploy API changes** with zero downtime
- [ ] **Update frontend components** with new parameter system
- [ ] **Migrate existing calculation data** to new system

#### **8.3 Post-Deployment**
- [ ] **Monitor system performance** after deployment
- [ ] **Validate all calculations** work correctly
- [ ] **Update documentation** for new parameter system
- [ ] **Train support team** on new system features

---

## **📊 PROGRESS TRACKING BY SECTIONS**

### **Overall Progress:** 0/80 tasks completed (0%)

**🔴 CRITICAL FIXES (Section 1):** 0/6 completed (0%)  
**🟡 DATABASE IMPLEMENTATION (Section 2):** 0/10 completed (0%)  
**🟢 API DEVELOPMENT (Section 3):** 0/10 completed (0%)  
**🔵 ADMIN PANEL UI (Section 4):** 0/10 completed (0%)  
**🟣 SECURITY & COMPLIANCE (Section 5):** 0/10 completed (0%)  
**🔶 PERFORMANCE & MONITORING (Section 6):** 0/10 completed (0%)  
**🟠 TESTING & VALIDATION (Section 7):** 0/10 completed (0%)  
**✅ DEPLOYMENT & ROLLOUT (Section 8):** 0/10 completed (0%)  

### **⚠️ NEXT ACTIONS:**
1. **IMMEDIATE:** Fix hardcoded values in server-db.js (Line 5075)
2. **THIS WEEK:** Create getBankCalculationParameters function for PostgreSQL
3. **URGENT:** Test that admin panel changes affect customer calculations

### **🐘 PostgreSQL-Specific Notes:**
- All SQL commands are PostgreSQL-compatible
- Uses JSONB for metadata storage
- Implements PostgreSQL-specific indexes (GIN, partial indexes)
- Includes PostgreSQL functions and triggers
- Optimized for PostgreSQL performance features

---

**Last Updated:** [DATE]  
**Updated By:** [NAME]  
**Current Phase:** Pre-Implementation  
**Database:** PostgreSQL
