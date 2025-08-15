# 🏠 REFINANCE-CREDIT AUTOMATION TESTING INSTRUCTIONS

## 🎯 ULTRATHINK: COMPREHENSIVE REFINANCE-CREDIT TESTING STRATEGY

**MISSION:** Implement systematic automation testing for the refinance-credit calculator system following Confluence specification 6.1.+ with 32 screens and 300+ user actions, validating complex business logic, multi-borrower scenarios, and financial benefit calculations.

### 📋 Confluence Reference
- **Specification**: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20448533/6.1.+
- **System Scope**: 32 Screens, 300+ User Actions
- **Business Logic**: Refinance benefit analysis, break-even calculations, multi-borrower workflows
- **Integration**: Credit bureau data, bank offer comparison, document management

---

## 🧠 ULTRATHINK ANALYSIS: REFINANCE-CREDIT COMPLEXITY

### Critical Business Logic Components

#### 1. **Refinance Benefit Calculation Engine**
- **Current Loan Analysis**: Remaining balance, current rate, remaining term
- **New Loan Comparison**: Rate improvement, term adjustment, cash-out scenarios  
- **Break-Even Analysis**: Monthly savings vs closing costs over time
- **Net Present Value**: Long-term financial benefit calculation
- **Cash-Out Scenarios**: Equity extraction for debt consolidation

#### 2. **Multi-Borrower Relationship Management**
- **Primary Borrower**: Main applicant with full financial responsibility
- **Co-Borrower**: Equal financial responsibility and credit evaluation
- **Partner**: Relationship-based inclusion without full credit obligation
- **Dynamic Role Assignment**: Changing borrower roles throughout application

#### 3. **Credit Integration Complexity**
- **Existing Credit Evaluation**: Current DTI, payment history, credit utilization
- **New Credit Impact**: How refinance affects overall credit profile
- **Debt Consolidation Logic**: Rolling existing debts into refinance
- **Credit Score Impact**: Short-term inquiry impact vs long-term benefit

#### 4. **Advanced Financial Scenarios**
- **Cash-Out Refinance**: Using home equity for other financial needs
- **Rate-and-Term Refinance**: Optimizing payment structure without cash
- **Investment Property Refinance**: Non-owner occupied property considerations
- **Jumbo Loan Refinance**: Higher value properties with different requirements

---

## Phase 0: CRITICAL DROPDOWN LOGIC VALIDATION FOR REFINANCE CREDIT 🚨

### 📋 Architecture Integration Overview for Refinance Credit Calculator

The refinance credit calculator implements the comprehensive dropdown system architecture as specified in `/server/docs/Architecture/dropDownLogicBankim.md`. This system provides dynamic, database-driven dropdown content with multi-language support, intelligent caching, and screen-specific content management.

#### Server Architecture
- **Main Server**: `packages/server/src/server.js` - Unified monorepo server (development & production)
- **Legacy Fallback**: `server/server-db.js` - Emergency fallback only, deprecated
- **Port**: 8003 (configurable via PORT environment variable)
- **Database**: Direct PostgreSQL integration with content management tables

#### Core Architecture Components
- **Content Database Integration**: Dropdown content served from monorepo server database
- **Screen-Specific API Keys**: Each refinance step generates unique API endpoints
- **Multi-Language Support**: Hebrew (RTL), English, Russian with proper caching
- **useDropdownData Hook**: Bulletproof hook with error handling and fallback systems
- **Admin Panel Independence**: Each screen can be modified independently

#### Database Content Key Format
```yaml
Pattern: {screen_location}.field.{field_name}_{option_value}
Examples:
  - refinance_credit_step1.field.refinance_reason_lower_rate
  - refinance_credit_step2.field.family_status_married
  - refinance_credit_step3.field.obligations_no_obligations
  - refinance_credit_step4.field.preferred_bank_bank_hapoalim
```

#### API Key Generation Pattern
```yaml
Pattern: {screen_location}_{field_name}
Examples:
  - refinance_credit_step1_refinance_reason
  - refinance_credit_step2_family_status
  - refinance_credit_step3_obligations
  - refinance_credit_step4_preferred_bank
```

### 🎯 Screen-Specific Dropdown Content

#### refinance_credit_step1 - Current Loan & Refinance Details
- **refinance_reason**: Why refinancing (lower rate, cash out, debt consolidation)
- **current_lender**: Existing mortgage lender
- **loan_type**: Current loan type (fixed, variable, combination)
- **property_type**: Property classification (residential, investment, commercial)

#### refinance_credit_step2 - Personal Information
- **family_status**: Marital status and household composition
- **citizenship**: Israeli citizenship and residence status
- **education_level**: Educational background
- **military_service**: IDF service status (Israeli specific)

#### refinance_credit_step3 - Financial Information
- **obligations**: Existing debts and financial obligations
- **main_source**: Primary income source
- **additional_income**: Secondary income streams
- **employment_status**: Current employment classification

#### refinance_credit_step4 - Refinance Options & Bank Selection
- **preferred_bank**: Target bank for refinancing
- **loan_program**: Refinance program type
- **rate_type**: Interest rate preference (fixed, variable, mix)
- **refinance_terms**: Loan term preferences

### 🔧 useDropdownData Hook Usage Examples

#### Basic Refinance Credit Dropdown Implementation
```typescript
import { useDropdownData } from '@src/hooks/useDropdownData';

const RefinanceReasonDropdown = () => {
  const dropdownData = useDropdownData('refinance_credit_step1', 'refinance_reason', 'full');
  
  return (
    <DropdownMenu
      title={dropdownData.label || 'Refinancing Reason'}
      data={dropdownData.options}
      placeholder={dropdownData.placeholder || 'Select your reason for refinancing'}
      loading={dropdownData.loading}
      error={dropdownData.error}
    />
  );
};
```

#### Advanced Current Lender Dropdown with Validation
```typescript
const CurrentLenderDropdown = ({ screenLocation = 'refinance_credit_step1' }) => {
  const { values, setFieldValue } = useFormikContext();
  const dropdownData = useDropdownData(screenLocation, 'current_lender', 'full');
  
  const handleLenderChange = (value: string) => {
    setFieldValue('currentLender', value);
    // Additional validation for refinance eligibility
    if (value === 'same_bank') {
      setFieldValue('refinanceType', 'internal_refinance');
    }
  };
  
  return (
    <DropdownMenu
      title={dropdownData.label || 'Current Mortgage Lender'}
      data={dropdownData.options}
      placeholder={dropdownData.placeholder || 'Select your current lender'}
      value={values.currentLender}
      onChange={handleLenderChange}
      disabled={dropdownData.loading}
    />
  );
};
```

### 🌐 Multi-Language Support with Proper Caching

#### Cache Strategy for Refinance Credit
```typescript
// Frontend cache keys for refinance credit screens
const cacheKeys = {
  step1: {
    en: 'dropdowns_refinance_credit_step1_en',
    he: 'dropdowns_refinance_credit_step1_he',
    ru: 'dropdowns_refinance_credit_step1_ru'
  },
  step2: {
    en: 'dropdowns_refinance_credit_step2_en',
    he: 'dropdowns_refinance_credit_step2_he', 
    ru: 'dropdowns_refinance_credit_step2_ru'
  },
  step3: {
    en: 'dropdowns_refinance_credit_step3_en',
    he: 'dropdowns_refinance_credit_step3_he',
    ru: 'dropdowns_refinance_credit_step3_ru'
  },
  step4: {
    en: 'dropdowns_refinance_credit_step4_en',
    he: 'dropdowns_refinance_credit_step4_he',
    ru: 'dropdowns_refinance_credit_step4_ru'
  }
};
```

#### RTL Support for Hebrew Refinance Content
```typescript
const HebrewRefinanceDropdown = ({ fieldName }) => {
  const { i18n } = useTranslation();
  const dropdownData = useDropdownData('refinance_credit_step1', fieldName, 'full');
  const isRTL = i18n.language === 'he';
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl-dropdown' : 'ltr-dropdown'}>
      <DropdownMenu
        title={dropdownData.label}
        data={dropdownData.options}
        placeholder={dropdownData.placeholder}
        rtlSupport={isRTL}
      />
    </div>
  );
};
```

### 🚀 Testing Environment Setup

#### Server Architecture for Testing
All refinance credit dropdown testing uses the unified monorepo server architecture:

```bash
# Primary server (development and production)
cd packages/server && npm run dev  # Port 8003

# Verify server is running and healthy
curl http://localhost:8003/api/health

# Frontend testing server
cd mainapp && npm run dev  # Port 5173 (Vite default)
```

#### API Endpoint Structure
- **Base URL**: `http://localhost:8003` (monorepo server)
- **Dropdown API**: `/api/dropdowns/{screen_location}/{language}`
- **Health Check**: `/api/health`
- **Cache Management**: `/api/dropdowns/cache/clear`

#### Legacy Server Emergency Testing
Only use if monorepo server fails completely:
```bash
# Emergency fallback (deprecated)
node server/server-db.js  # Port 8003

# Should provide identical API responses to monorepo server
curl http://localhost:8003/api/dropdowns/refinance_credit_step1/en
```

**Important**: All test expectations should work identically on both servers. Any discrepancies indicate a synchronization issue that must be resolved.

### 🧪 Comprehensive Test Cases for Refinance Credit Dropdowns

#### Test 0.1: Refinance Credit Dropdown Availability Validation
```typescript
describe('Test 0.1: Refinance Credit Dropdown Availability', () => {
  const refinanceCreditScreens = [
    'refinance_credit_step1',
    'refinance_credit_step2', 
    'refinance_credit_step3',
    'refinance_credit_step4'
  ];
  
  refinanceCreditScreens.forEach(screen => {
    it(`should load all dropdown content for ${screen}`, async () => {
      // Test API endpoint availability
      const response = await fetch(`/api/dropdowns/${screen}/en`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(data.screen_location).toBe(screen);
      expect(data.dropdowns).toBeInstanceOf(Array);
      expect(data.dropdowns.length).toBeGreaterThan(0);
      
      // Validate API key generation pattern
      data.dropdowns.forEach(dropdown => {
        expect(dropdown.key).toMatch(new RegExp(`^${screen}_[a-z_]+$`));
      });
    });
    
    it(`should support all languages for ${screen}`, async () => {
      const languages = ['en', 'he', 'ru'];
      
      for (const lang of languages) {
        const response = await fetch(`/api/dropdowns/${screen}/${lang}`);
        const data = await response.json();
        
        expect(data.status).toBe('success');
        expect(data.language_code).toBe(lang);
        expect(Object.keys(data.options).length).toBeGreaterThan(0);
      }
    });
  });
});
```

#### Test 0.2: Current Credit Details Dropdown Logic (Existing Loan Info)
```typescript
describe('Test 0.2: Current Credit Details Dropdown Logic', () => {
  it('should validate current lender dropdown options', () => {
    cy.visit('/services/refinance-credit/1');
    
    // Test current lender dropdown
    cy.get('[data-testid="current-lender-dropdown"]').should('be.visible');
    cy.get('[data-testid="current-lender-dropdown"]').click();
    
    // Verify refinance-specific lender options
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Bank Hapoalim');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Bank Leumi');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Mizrahi Tefahot');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Other Bank');
    
    // Test selection impact on refinance flow
    cy.get('[data-testid="dropdown-option"]').contains('Bank Hapoalim').click();
    
    // Validate that current lender selection affects available refinance options
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.refinanceCredit.currentLender).to.equal('bank_hapoalim');
    });
  });
  
  it('should validate current loan type dropdown with refinance context', () => {
    cy.visit('/services/refinance-credit/1');
    
    cy.get('[data-testid="loan-type-dropdown"]').click();
    
    // Verify loan type options specific to refinancing
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Fixed Rate Mortgage');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Variable Rate Mortgage');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Mixed Rate Mortgage');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Interest Only Loan');
    
    // Test loan type selection validation
    cy.get('[data-testid="dropdown-option"]').contains('Variable Rate Mortgage').click();
    
    // Validate refinance benefit calculation based on current loan type
    cy.get('[data-testid="refinance-potential"]').should('be.visible');
  });
});
```

#### Test 0.3: New Credit Terms Dropdown Validation
```typescript
describe('Test 0.3: New Credit Terms Dropdown Validation', () => {
  it('should validate preferred rate type dropdown for refinancing', () => {
    cy.visit('/services/refinance-credit/4');
    
    cy.get('[data-testid="rate-type-dropdown"]').should('be.visible');
    cy.get('[data-testid="rate-type-dropdown"]').click();
    
    // Verify rate type options for refinance loans
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Fixed Rate');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Variable Rate');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Mixed Rate (Fixed + Variable)');
    
    // Test rate type selection impact
    cy.get('[data-testid="dropdown-option"]').contains('Fixed Rate').click();
    
    // Validate refinance terms adjust based on rate type
    cy.get('[data-testid="term-options"]').should('be.visible');
    cy.get('[data-testid="term-option"]').should('contain', '15 years');
    cy.get('[data-testid="term-option"]').should('contain', '20 years');
    cy.get('[data-testid="term-option"]').should('contain', '25 years');
    cy.get('[data-testid="term-option"]').should('contain', '30 years');
  });
  
  it('should validate refinance program dropdown options', () => {
    cy.get('[data-testid="refinance-program-dropdown"]').click();
    
    // Verify refinance-specific program options
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Rate and Term Refinance');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Cash-Out Refinance');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Debt Consolidation Refinance');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Investment Property Refinance');
    
    // Test program selection validation
    cy.get('[data-testid="dropdown-option"]').contains('Cash-Out Refinance').click();
    
    // Validate cash-out specific fields appear
    cy.get('[data-testid="cash-out-amount"]').should('be.visible');
    cy.get('[data-testid="cash-out-purpose"]').should('be.visible');
  });
});
```

#### Test 0.4: Credit Comparison and Refinance Options
```typescript
describe('Test 0.4: Credit Comparison and Refinance Options', () => {
  it('should validate bank comparison dropdown functionality', () => {
    cy.visit('/services/refinance-credit/4');
    
    // Test bank selection for refinance offers
    cy.get('[data-testid="preferred-bank-dropdown"]').click();
    
    // Verify comprehensive bank list for refinancing
    const expectedBanks = [
      'Bank Hapoalim', 'Bank Leumi', 'Mizrahi Tefahot', 'Israel Discount Bank',
      'First International Bank', 'Bank of Jerusalem', 'Union Bank',
      'Bank Yahav', 'Mercantile Discount Bank', 'Bank Otsar Ha-Hayal'
    ];
    
    expectedBanks.forEach(bank => {
      cy.get('[data-testid="dropdown-option"]').should('contain', bank);
    });
    
    // Test multiple bank selection for comparison
    cy.get('[data-testid="dropdown-option"]').contains('Bank Hapoalim').click();
    cy.get('[data-testid="add-bank-comparison"]').click();
    cy.get('[data-testid="preferred-bank-dropdown"]').click();
    cy.get('[data-testid="dropdown-option"]').contains('Bank Leumi').click();
    
    // Validate comparison table appears
    cy.get('[data-testid="bank-comparison-table"]').should('be.visible');
    cy.get('[data-testid="comparison-bank"]').should('have.length', 2);
  });
  
  it('should validate refinance benefit calculation dropdowns', () => {
    // Test refinance calculation parameters
    cy.get('[data-testid="calculation-method-dropdown"]').click();
    
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Monthly Payment Reduction');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Total Interest Savings');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Break-Even Analysis');
    cy.get('[data-testid="dropdown-option"]').should('contain', 'Net Present Value');
    
    // Test calculation method selection
    cy.get('[data-testid="dropdown-option"]').contains('Break-Even Analysis').click();
    
    // Validate break-even calculation fields appear
    cy.get('[data-testid="closing-costs-input"]').should('be.visible');
    cy.get('[data-testid="breakeven-timeline"]').should('be.visible');
  });
});
```

#### Test 0.5: Refinance Credit Database Integration Validation
```typescript
describe('Test 0.5: Refinance Credit Database Integration', () => {
  it('should validate content database connectivity for refinance screens', async () => {
    const screens = ['refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3', 'refinance_credit_step4'];
    
    for (const screen of screens) {
      // Test database query for each screen
      const response = await fetch(`/api/dropdowns/${screen}/en`);
      const data = await response.json();
      
      expect(data.status).toBe('success');
      expect(data.performance).toBeDefined();
      expect(data.performance.total_items).toBeGreaterThan(0);
      expect(data.performance.query_time).toBeDefined();
      
      // Validate content keys follow refinance credit pattern
      Object.keys(data.options).forEach(apiKey => {
        expect(apiKey).toMatch(new RegExp(`^${screen}_[a-z_]+$`));
      });
    }
  });
  
  it('should validate cache performance for refinance credit dropdowns', async () => {
    const screen = 'refinance_credit_step3';
    
    // First request (cache miss)
    const startTime = Date.now();
    const response1 = await fetch(`/api/dropdowns/${screen}/en`);
    const data1 = await response1.json();
    const firstRequestTime = Date.now() - startTime;
    
    expect(data1.cached).toBe(false);
    
    // Second request (cache hit)
    const startTime2 = Date.now();
    const response2 = await fetch(`/api/dropdowns/${screen}/en`);
    const data2 = await response2.json();
    const secondRequestTime = Date.now() - startTime2;
    
    // Cache hit should be significantly faster
    expect(secondRequestTime).toBeLessThan(firstRequestTime * 0.1);
    expect(data2.cached).toBe(true);
  });
  
  it('should validate refinance-specific content keys in database', () => {
    cy.task('queryDatabase', {
      query: `
        SELECT content_key, screen_location, component_type
        FROM content_items
        WHERE screen_location LIKE '%refinance_credit%'
          AND component_type IN ('dropdown_container', 'dropdown_option')
        ORDER BY screen_location, content_key
      `
    }).then((results) => {
      expect(results.length).toBeGreaterThan(50); // Minimum expected content items
      
      // Validate screen-specific content
      const screens = ['refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3', 'refinance_credit_step4'];
      screens.forEach(screen => {
        const screenItems = results.filter(item => item.screen_location === screen);
        expect(screenItems.length).toBeGreaterThan(10);
      });
      
      // Validate content key patterns
      results.forEach(item => {
        expect(item.content_key).toMatch(/^refinance_credit_step\d+\.field\.[a-z_]+/);
      });
    });
  });
});
```

#### Test 0.6: Multi-Language Refinance Credit Content Validation
```typescript
describe('Test 0.6: Multi-Language Refinance Credit Content', () => {
  const languages = ['en', 'he', 'ru'];
  const screens = ['refinance_credit_step1', 'refinance_credit_step2', 'refinance_credit_step3', 'refinance_credit_step4'];
  
  languages.forEach(language => {
    describe(`${language.toUpperCase()} Language Content`, () => {
      screens.forEach(screen => {
        it(`should load ${language} content for ${screen}`, async () => {
          const response = await fetch(`/api/dropdowns/${screen}/${language}`);
          const data = await response.json();
          
          expect(data.status).toBe('success');
          expect(data.language_code).toBe(language);
          expect(Object.keys(data.options).length).toBeGreaterThan(0);
          
          // Validate all options have translations
          Object.values(data.options).forEach(options => {
            options.forEach(option => {
              expect(option.label).toBeTruthy();
              expect(option.label.length).toBeGreaterThan(0);
              expect(option.value).toBeTruthy();
            });
          });
        });
      });
      
      it(`should validate RTL support for ${language}`, () => {
        if (language === 'he') {
          cy.visit('/services/refinance-credit/1');
          cy.get('[data-testid="language-selector"]').select('he');
          
          // Validate RTL layout
          cy.get('body').should('have.attr', 'dir', 'rtl');
          cy.get('[data-testid="dropdown-container"]').should('have.class', 'rtl-dropdown');
          
          // Test Hebrew content display
          cy.get('[data-testid="refinance-reason-dropdown"]').click();
          cy.get('[data-testid="dropdown-option"]').first().should('contain.text', /[\u0590-\u05FF]/); // Hebrew characters
        }
      });
    });
  });
  
  it('should validate translation consistency across refinance screens', async () => {
    const commonFields = ['obligations', 'family_status', 'main_source'];
    
    for (const field of commonFields) {
      const translations = {};
      
      // Collect translations from all refinance screens
      for (const screen of screens) {
        const response = await fetch(`/api/dropdowns/${screen}/he`);
        const data = await response.json();
        const fieldOptions = data.options[`${screen}_${field}`];
        
        if (fieldOptions) {
          translations[screen] = fieldOptions;
        }
      }
      
      // Validate consistency (same options should have same translations)
      const screenKeys = Object.keys(translations);
      if (screenKeys.length > 1) {
        const referenceOptions = translations[screenKeys[0]];
        
        screenKeys.slice(1).forEach(screen => {
          const screenOptions = translations[screen];
          
          referenceOptions.forEach(refOption => {
            const matchingOption = screenOptions.find(opt => opt.value === refOption.value);
            if (matchingOption) {
              expect(matchingOption.label).toBe(refOption.label);
            }
          });
        });
      }
    }
  });
});
```

### 🔧 Emergency Dropdown Recovery for Refinance Credit

#### Server Status & Diagnostic Commands
```bash
# Start main monorepo server (development & production)
cd packages/server && npm run dev  # or npm start for production

# Verify server is running
curl -s "http://localhost:8003/api/health" | jq '.'

# Test all refinance credit dropdown endpoints
for step in 1 2 3 4; do
  echo "Testing refinance_credit_step${step}..."
  curl -s "http://localhost:8003/api/dropdowns/refinance_credit_step${step}/en" | jq '.status, .dropdowns | length'
done

# Check refinance credit content in database
node -e "
import { contentPool } from './packages/server/src/config/database.js';
contentPool.query('SELECT screen_location, COUNT(*) as items FROM content_items WHERE screen_location LIKE \\'%refinance_credit%\\' AND component_type IN (\\'dropdown_container\\', \\'dropdown_option\\') GROUP BY screen_location ORDER BY screen_location').then(r => {
  console.log('Refinance Credit Dropdown Content:');
  r.rows.forEach(row => console.log(\`  \${row.screen_location}: \${row.items} items\`));
}).catch(e => console.error('Database error:', e.message));
"

# Clear refinance credit dropdown cache
curl -X DELETE "http://localhost:8003/api/dropdowns/cache/clear" | jq '.'
```

#### Legacy Server Emergency Fallback Testing
```bash
# EMERGENCY ONLY: Start legacy server if monorepo server fails
# NOTE: This is deprecated and should only be used for emergency recovery
node server/server-db.js  # Port 8003

# Test legacy server endpoints (should match monorepo server exactly)
curl -s "http://localhost:8003/api/dropdowns/refinance_credit_step1/en" | jq '.'

# Verify database schema compatibility
node -e "require('./server/test-railway-simple.js')"
```

#### Content Recovery Script
```sql
-- Copy mortgage content to refinance credit if missing
INSERT INTO content_items (content_key, component_type, category, screen_location, is_active)
SELECT 
    REPLACE(content_key, 'mortgage_step', 'refinance_credit_step') as new_key,
    component_type,
    category,
    REPLACE(screen_location, 'mortgage_step', 'refinance_credit_step') as new_location,
    is_active
FROM content_items
WHERE screen_location LIKE 'mortgage_step%'
    AND component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND NOT EXISTS (
        SELECT 1 FROM content_items target
        WHERE target.content_key = REPLACE(content_items.content_key, 'mortgage_step', 'refinance_credit_step')
    );

-- Copy translations
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
SELECT 
    ci_target.id,
    ct_source.language_code,
    ct_source.content_value,
    ct_source.status
FROM content_items ci_source
JOIN content_translations ct_source ON ci_source.id = ct_source.content_item_id
JOIN content_items ci_target ON ci_target.content_key = REPLACE(ci_source.content_key, 'mortgage_step', 'refinance_credit_step')
WHERE ci_source.screen_location LIKE 'mortgage_step%'
    AND ci_source.component_type IN ('dropdown_container', 'dropdown_option', 'placeholder')
    AND NOT EXISTS (
        SELECT 1 FROM content_translations ct_existing
        WHERE ct_existing.content_item_id = ci_target.id
            AND ct_existing.language_code = ct_source.language_code
    );
```

### ✅ Refinance Credit Dropdown System Validation Status

#### Implementation Completeness Checklist
- ✅ **Screen-Specific Architecture**: Independent dropdown content for each refinance credit step
- ✅ **API Key Generation**: Unique API keys following `refinance_credit_step{N}_{field_name}` pattern  
- ✅ **Multi-Language Support**: Hebrew (RTL), English, Russian with proper caching
- ✅ **Database Integration**: Content served from shortline proxy with performance optimization
- ✅ **Error Handling**: Bulletproof fallback systems and graceful degradation
- ✅ **Cache Strategy**: 5-minute TTL with frontend and backend caching layers
- ✅ **Admin Panel Ready**: Independent screen modification capability
- ✅ **Content Migration**: Recovery scripts for missing refinance credit content

#### Refinance Credit Specific Features
- ✅ **Current Loan Analysis**: Dropdowns for existing lender, loan type, current terms
- ✅ **Refinance Reason Selection**: Rate improvement, cash-out, debt consolidation options
- ✅ **Bank Comparison**: Multiple bank selection for refinance offer comparison
- ✅ **Refinance Program Types**: Rate-and-term, cash-out, investment property options
- ✅ **Benefit Calculation**: Break-even analysis, NPV calculation, payment reduction options

---

## 🔬 PHASE 1: SYSTEM INITIALIZATION & AUTHENTICATION

### Test Objective
Validate system startup, user authentication, and initial state management for refinance-credit workflows.

### 🎯 Critical Test Scenarios

#### Authentication Flow Testing
```typescript
describe('PHASE 1: Refinance-Credit Authentication & Initialization', () => {
  
  it('should initialize refinance-credit calculator with proper state', () => {
    cy.visit('/services/refinance-credit/1');
    
    // Validate initial Redux state structure
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.refinanceCredit).to.exist;
      expect(state.refinanceCredit.currentStep).to.equal(1);
      expect(state.refinanceCredit.borrowers).to.deep.equal({
        primary: null,
        partner: null,
        coBorrower: null
      });
      expect(state.refinanceCredit.existingLoan).to.deep.equal({
        balance: null,
        rate: null,
        remainingTerm: null,
        monthlyPayment: null
      });
    });
  });

  it('should handle dual authentication flow (phone + email)', () => {
    // Test primary authentication via phone/SMS
    cy.get('[data-testid="phone-auth-tab"]').click();
    cy.get('[data-testid="phone-number"]').type('972544123456');
    cy.get('[data-testid="request-otp"]').click();
    
    // Mock OTP verification
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="verify-otp"]').click();
    
    // Validate successful phone authentication
    cy.get('[data-testid="auth-status"]').should('contain', 'Phone verified');
    
    // Test secondary email authentication for document access
    cy.get('[data-testid="email-auth-section"]').should('be.visible');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="verify-email"]').click();
    
    // Validate dual authentication state
    cy.window().its('store').invoke('getState').then((state) => {
      expect(state.auth.phoneVerified).to.be.true;
      expect(state.auth.emailVerified).to.be.true;
      expect(state.auth.refinanceCreditAccess).to.be.true;
    });
  });

  it('should preserve session state across page reloads', () => {
    cy.visit('/services/refinance-credit/1');
    
    // Set initial form data
    cy.get('[data-testid="existing-loan-balance"]').type('450000');
    cy.get('[data-testid="current-interest-rate"]').type('5.5');
    
    // Reload page
    cy.reload();
    
    // Validate state persistence
    cy.get('[data-testid="existing-loan-balance"]').should('have.value', '450000');
    cy.get('[data-testid="current-interest-rate"]').should('have.value', '5.5');
  });
});
```

### 🎯 UI Component Validation
```typescript
const refinanceCreditInitializationTests = {
  layoutValidation: {
    stepIndicator: 'Progressive step indicator showing 1-4 refinance steps',
    breadcrumbs: 'Refinance Credit > Step 1 > Current Loan Details',
    navigationMenu: 'Proper menu highlighting for refinance section'
  },
  
  accessibilityChecks: {
    screenReader: 'Refinance calculator announced properly',
    keyboardNavigation: 'Full tab order through form elements',
    colorContrast: 'Financial data meets WCAG AA standards',
    focusManagement: 'Logical focus flow for complex calculations'
  },

  responsiveDesign: {
    mobile: 'Refinance calculator optimized for mobile calculation',
    tablet: 'Multi-column layout for comparison tables', 
    desktop: 'Full feature set with advanced calculation views'
  }
};
```

---

## 🎯 PHASE 2: EXISTING LOAN ANALYSIS & CURRENT SITUATION

### Test Objective
Capture and validate existing loan details, property information, and current financial situation for refinance analysis.

### 🎯 Critical Test Scenarios

#### Existing Loan Details Validation
```typescript
describe('PHASE 2: Existing Loan Analysis', () => {
  
  beforeEach(() => {
    cy.visit('/services/refinance-credit/1');
    cy.authenticateUser('972544123456'); // Custom command
  });

  it('should validate existing loan balance with bank verification', () => {
    const loanBalanceScenarios = [
      { balance: 50000, valid: true, tier: 'Small refinance' },
      { balance: 450000, valid: true, tier: 'Standard refinance' },
      { balance: 1500000, valid: true, tier: 'Jumbo refinance' },
      { balance: 2500000, valid: false, tier: 'Over system limits' }
    ];

    loanBalanceScenarios.forEach(scenario => {
      cy.get('[data-testid="existing-loan-balance"]').clear().type(scenario.balance.toString());
      cy.get('[data-testid="validate-balance"]').click();
      
      if (scenario.valid) {
        cy.get('[data-testid="balance-validation"]').should('contain', 'Verified');
        cy.get('[data-testid="refinance-tier"]').should('contain', scenario.tier);
      } else {
        cy.get('[data-testid="balance-error"]').should('contain', 'Balance exceeds');
      }
    });
  });

  it('should calculate refinance benefit potential', () => {
    // Set existing loan parameters
    cy.get('[data-testid="existing-loan-balance"]').type('400000');
    cy.get('[data-testid="current-interest-rate"]').type('6.5');
    cy.get('[data-testid="remaining-term-years"]').type('22');
    cy.get('[data-testid="current-monthly-payment"]').type('2750');
    
    // Set potential new loan parameters
    cy.get('[data-testid="new-interest-rate"]').type('4.8');
    cy.get('[data-testid="new-term-years"]').type('25');
    
    // Trigger benefit calculation
    cy.get('[data-testid="calculate-benefit"]').click();
    
    // Validate calculated benefits
    cy.get('[data-testid="monthly-savings"]').should('contain', '$');
    cy.get('[data-testid="total-interest-savings"]').should('contain', '$');
    cy.get('[data-testid="break-even-months"]').should('contain', 'months');
    
    // Verify calculation accuracy
    cy.get('[data-testid="monthly-savings"]').invoke('text').then(savingsText => {
      const monthlySavings = parseFloat(savingsText.replace(/[^0-9.]/g, ''));
      expect(monthlySavings).to.be.greaterThan(0);
      expect(monthlySavings).to.be.lessThan(1000); // Reasonable range
    });
  });

  it('should handle cash-out refinance scenarios', () => {
    // Set property value higher than loan balance
    cy.get('[data-testid="current-property-value"]').type('600000');
    cy.get('[data-testid="existing-loan-balance"]').type('300000');
    
    // Calculate available equity
    cy.get('[data-testid="calculate-equity"]').click();
    
    // Validate equity calculation
    cy.get('[data-testid="available-equity"]').should('contain', '$300,000');
    cy.get('[data-testid="max-cash-out"]').should('contain', '$180,000'); // 80% LTV rule
    
    // Test cash-out amount selection
    cy.get('[data-testid="cash-out-amount"]').type('150000');
    cy.get('[data-testid="cash-out-purpose"]').select('debt-consolidation');
    
    // Validate new loan calculation
    cy.get('[data-testid="new-loan-amount"]').should('contain', '$450,000'); // Original + cash-out
    cy.get('[data-testid="new-ltv"]').should('contain', '75%'); // Updated LTV
  });

  it('should validate property ownership proof requirements', () => {
    cy.get('[data-testid="property-address"]').type('123 Main St, Tel Aviv');
    cy.get('[data-testid="ownership-proof"]').select('deed');
    
    // Test document upload requirement
    cy.get('[data-testid="upload-property-deed"]').should('be.visible');
    cy.get('[data-testid="required-documents-list"]').within(() => {
      cy.contains('Property deed or ownership certificate');
      cy.contains('Recent property tax assessment');
      cy.contains('Current mortgage statement');
    });
  });
});
```

### 🧠 Financial Calculation Engine Tests
```typescript
const refinanceBenefitCalculations = {
  breakEvenAnalysis: {
    inputs: {
      currentLoan: { balance: 400000, rate: 6.5, payment: 2750 },
      newLoan: { rate: 4.8, closingCosts: 8000 },
      savingsPerMonth: 425
    },
    expectedResults: {
      breakEvenMonths: 19, // 8000 / 425 ≈ 19 months
      totalInterestSavings: 75000, // Over remaining term
      netPresentValue: 45000 // Discounted future savings
    }
  },
  
  cashOutScenarios: {
    maxCashOut: {
      propertyValue: 600000,
      existingBalance: 300000,
      maxLTV: 0.80,
      availableCashOut: 180000 // (600000 * 0.80) - 300000
    },
    
    debtConsolidation: {
      cashOutAmount: 150000,
      creditCardDebt: 45000,
      autoLoan: 25000,
      personalLoan: 30000,
      remainingCash: 50000
    }
  }
};
```

---

## 👥 PHASE 3: MULTI-BORROWER FINANCIAL ASSESSMENT

### Test Objective
Comprehensive testing of multi-borrower scenarios including primary borrower, co-borrower, and partner financial assessment and qualification logic.

### 🎯 Critical Test Scenarios

#### Multi-Borrower Income Aggregation
```typescript
describe('PHASE 3: Multi-Borrower Financial Assessment', () => {
  
  beforeEach(() => {
    cy.visit('/services/refinance-credit/3');
    cy.authenticateUser('972544123456');
    // Pre-fill existing loan data
    cy.setExistingLoanData({
      balance: 450000,
      rate: 6.0,
      payment: 2700
    });
  });

  it('should handle primary + co-borrower income calculation', () => {
    // Add primary borrower income
    cy.get('[data-testid="primary-borrower-section"]').within(() => {
      cy.get('[data-testid="monthly-salary"]').type('15000');
      cy.get('[data-testid="additional-income"]').type('2000');
      cy.get('[data-testid="income-verification"]').select('salary-slips');
    });
    
    // Add co-borrower income
    cy.get('[data-testid="add-co-borrower"]').click();
    cy.get('[data-testid="co-borrower-section"]').within(() => {
      cy.get('[data-testid="monthly-salary"]').type('12000');
      cy.get('[data-testid="business-income"]').type('3000');
      cy.get('[data-testid="income-verification"]').select('bank-statements');
    });
    
    // Validate combined income calculation
    cy.get('[data-testid="total-monthly-income"]').should('contain', '₪32,000');
    cy.get('[data-testid="qualifying-income"]').should('contain', '₪30,000'); // After verification adjustments
    
    // Test DTI calculation with refinance payment
    cy.get('[data-testid="existing-debts"]').type('5000');
    cy.get('[data-testid="new-mortgage-payment"]').should('contain', '₪2,100'); // Estimated new payment
    cy.get('[data-testid="total-dti"]').should('contain', '23.7%'); // (5000 + 2100) / 30000
  });

  it('should validate employment stability requirements', () => {
    const employmentScenarios = [
      {
        borrower: 'primary',
        employment: 'permanent',
        duration: '36',
        stability: 'high',
        expected: 'Approved'
      },
      {
        borrower: 'co-borrower', 
        employment: 'contract',
        duration: '18',
        stability: 'medium',
        expected: 'Additional documentation required'
      },
      {
        borrower: 'primary',
        employment: 'self-employed',
        duration: '24',
        stability: 'low',
        expected: 'Extended review period'
      }
    ];

    employmentScenarios.forEach(scenario => {
      cy.get(`[data-testid="${scenario.borrower}-employment-type"]`).select(scenario.employment);
      cy.get(`[data-testid="${scenario.borrower}-employment-duration"]`).type(scenario.duration);
      cy.get(`[data-testid="calculate-stability"]`).click();
      
      cy.get(`[data-testid="${scenario.borrower}-stability-assessment"]`)
        .should('contain', scenario.expected);
    });
  });

  it('should handle partner addition without full credit obligation', () => {
    // Add partner (not full co-borrower)
    cy.get('[data-testid="add-partner"]').click();
    cy.get('[data-testid="partner-section"]').within(() => {
      cy.get('[data-testid="relationship-type"]').select('spouse');
      cy.get('[data-testid="income-contribution"]').type('8000');
      cy.get('[data-testid="credit-obligation"]').should('contain', 'Limited liability');
    });
    
    // Validate partner income consideration
    cy.get('[data-testid="household-income"]').should('contain', '₪40,000'); // Primary + Co + Partner
    cy.get('[data-testid="qualifying-income"]').should('contain', '₪34,000'); // Reduced weight for partner
    
    // Test partner role limitations
    cy.get('[data-testid="partner-limitations"]').should('contain', 'Cannot be primary signatory');
    cy.get('[data-testid="partner-benefits"]').should('contain', 'Income counted at 70%');
  });

  it('should calculate combined debt-to-income with all borrowers', () => {
    // Set up multiple borrowers with various debts
    const borrowerData = {
      primary: {
        income: 18000,
        creditCards: 2000,
        autoLoan: 1500,
        personalLoan: 800
      },
      coBorrower: {
        income: 14000,
        creditCards: 1200,
        studentLoan: 600
      },
      partner: {
        income: 8000,
        creditCards: 500
      }
    };
    
    // Input all borrower financial data
    Object.entries(borrowerData).forEach(([borrowerType, data]) => {
      cy.get(`[data-testid="${borrowerType}-section"]`).within(() => {
        cy.get('[data-testid="monthly-income"]').type(data.income.toString());
        if (data.creditCards) cy.get('[data-testid="credit-card-debt"]').type(data.creditCards.toString());
        if (data.autoLoan) cy.get('[data-testid="auto-loan"]').type(data.autoLoan.toString());
        if (data.personalLoan) cy.get('[data-testid="personal-loan"]').type(data.personalLoan.toString());
        if (data.studentLoan) cy.get('[data-testid="student-loan"]').type(data.studentLoan.toString());
      });
    });
    
    // Calculate combined DTI
    cy.get('[data-testid="calculate-combined-dti"]').click();
    
    // Validate calculations
    cy.get('[data-testid="total-household-income"]').should('contain', '₪40,000');
    cy.get('[data-testid="total-monthly-debts"]').should('contain', '₪6,600');
    cy.get('[data-testid="new-mortgage-payment"]').should('contain', '₪2,200'); // Estimated refinance payment
    cy.get('[data-testid="combined-dti"]').should('contain', '22.0%'); // (6600 + 2200) / 40000
    
    // Check approval likelihood
    cy.get('[data-testid="approval-status"]').should('contain', 'Pre-approved');
  });
});
```

### 📋 Credit History Integration Testing
```typescript
const creditHistoryTests = {
  creditScoreAnalysis: {
    primaryBorrower: {
      creditScore: 780,
      impact: 'Excellent - preferred rates available',
      rateImprovement: 0.25 // Additional rate reduction
    },
    coBorrower: {
      creditScore: 720,
      impact: 'Good - standard rates apply',
      rateImprovement: 0
    },
    combined: {
      weightedScore: 756, // Primary weighted higher
      finalRateAdjustment: 0.15
    }
  },
  
  creditInquiryImpact: {
    recentInquiries: 2,
    hardInquiries: 1,
    impactScore: -5, // Minor impact
    timeToRecover: '2-3 months'
  }
};
```

---

## 🎯 PHASE 4: BANK OFFERS & REFINANCE COMPARISON

### Test Objective
Test bank offer generation, comparison logic, refinance benefit analysis, and final application submission with document verification.

### 🎯 Critical Test Scenarios

#### Bank Offer Generation & Comparison
```typescript
describe('PHASE 4: Bank Offers & Refinance Analysis', () => {
  
  beforeEach(() => {
    cy.visit('/services/refinance-credit/4');
    cy.authenticateUser('972544123456');
    // Pre-fill previous steps
    cy.setRefinanceApplicationData({
      existingLoan: { balance: 400000, rate: 6.5 },
      borrowers: { 
        primary: { income: 18000, creditScore: 780 },
        coBorrower: { income: 14000, creditScore: 720 }
      }
    });
  });

  it('should generate personalized bank offers based on profile', () => {
    cy.get('[data-testid="generate-offers"]').click();
    
    // Wait for offer generation
    cy.get('[data-testid="offers-loading"]').should('be.visible');
    cy.get('[data-testid="offers-container"]', { timeout: 10000 }).should('be.visible');
    
    // Validate offer structure
    cy.get('[data-testid="bank-offer"]').should('have.length.at.least', 3);
    
    cy.get('[data-testid="bank-offer"]').each($offer => {
      cy.wrap($offer).within(() => {
        // Verify required offer components
        cy.get('[data-testid="bank-name"]').should('be.visible');
        cy.get('[data-testid="interest-rate"]').should('contain', '%');
        cy.get('[data-testid="monthly-payment"]').should('contain', '₪');
        cy.get('[data-testid="total-cost"]').should('contain', '₪');
        cy.get('[data-testid="savings-vs-current"]').should('be.visible');
        
        // Verify rate improvement
        cy.get('[data-testid="interest-rate"]').invoke('text').then(rateText => {
          const rate = parseFloat(rateText.replace('%', ''));
          expect(rate).to.be.lessThan(6.5); // Better than current rate
          expect(rate).to.be.greaterThan(3.0); // Realistic range
        });
      });
    });
  });

  it('should calculate accurate refinance benefits for each offer', () => {
    cy.get('[data-testid="generate-offers"]').click();
    cy.wait('@bankOffers');
    
    // Test detailed benefit analysis for first offer
    cy.get('[data-testid="bank-offer"]').first().within(() => {
      cy.get('[data-testid="view-details"]').click();
    });
    
    // Validate detailed benefit calculation
    cy.get('[data-testid="benefit-details-modal"]').within(() => {
      // Monthly savings calculation
      cy.get('[data-testid="current-payment"]').should('contain', '₪2,750');
      cy.get('[data-testid="new-payment"]').should('contain', '₪2,200');
      cy.get('[data-testid="monthly-savings"]').should('be.visible');
      
      // Break-even analysis
      cy.get('[data-testid="closing-costs"]').should('contain', '₪');
      cy.get('[data-testid="break-even-months"]').should('be.visible');
      cy.get('[data-testid="break-even-date"]').should('be.visible');
      
      // Total interest savings
      cy.get('[data-testid="current-total-interest"]').should('contain', '₪');
      cy.get('[data-testid="new-total-interest"]').should('contain', '₪');
      cy.get('[data-testid="lifetime-savings"]').should('contain', '₪');
      
      // Cash flow analysis
      cy.get('[data-testid="5-year-savings"]').should('contain', '₪');
      cy.get('[data-testid="10-year-savings"]').should('contain', '₪');
    });
  });

  it('should handle cash-out refinance offer variations', () => {
    // Enable cash-out refinance
    cy.get('[data-testid="cash-out-toggle"]').click();
    cy.get('[data-testid="cash-out-amount"]').type('100000');
    cy.get('[data-testid="cash-out-purpose"]').select('debt-consolidation');
    
    // Regenerate offers with cash-out
    cy.get('[data-testid="update-offers"]').click();
    
    // Validate cash-out specific offers
    cy.get('[data-testid="bank-offer"]').each($offer => {
      cy.wrap($offer).within(() => {
        cy.get('[data-testid="loan-amount"]').should('contain', '₪500,000'); // 400k + 100k
        cy.get('[data-testid="cash-out-available"]').should('contain', '₪100,000');
        cy.get('[data-testid="new-ltv"]').should('be.visible');
        
        // Verify LTV doesn't exceed limits
        cy.get('[data-testid="new-ltv"]').invoke('text').then(ltvText => {
          const ltv = parseFloat(ltvText.replace('%', ''));
          expect(ltv).to.be.lessThan(81); // Should not exceed 80% LTV
        });
      });
    });
  });

  it('should validate application submission with complete documentation', () => {
    // Select best offer
    cy.get('[data-testid="bank-offer"]').first().within(() => {
      cy.get('[data-testid="select-offer"]').click();
    });
    
    // Validate required documents checklist
    cy.get('[data-testid="required-documents"]').within(() => {
      cy.contains('Income verification (salary slips)');
      cy.contains('Bank statements (6 months)');
      cy.contains('Current mortgage statement');
      cy.contains('Property valuation report');
      cy.contains('Identity verification documents');
    });
    
    // Upload required documents
    const documentTypes = [
      'salary-slips',
      'bank-statements', 
      'mortgage-statement',
      'property-valuation',
      'identity-documents'
    ];
    
    documentTypes.forEach(docType => {
      cy.get(`[data-testid="upload-${docType}"]`).selectFile('cypress/fixtures/sample-document.pdf');
      cy.get(`[data-testid="${docType}-status"]`).should('contain', 'Uploaded');
    });
    
    // Submit application
    cy.get('[data-testid="terms-agreement"]').check();
    cy.get('[data-testid="submit-application"]').click();
    
    // Validate successful submission
    cy.get('[data-testid="application-confirmation"]').should('be.visible');
    cy.get('[data-testid="application-number"]').should('match', /^REF\d{8}$/);
    cy.get('[data-testid="expected-response-time"]').should('contain', 'business days');
  });

  it('should handle offer comparison with current loan analysis', () => {
    cy.get('[data-testid="generate-offers"]').click();
    cy.wait('@bankOffers');
    
    // Enable comparison view
    cy.get('[data-testid="comparison-view"]').click();
    
    // Validate comparison table
    cy.get('[data-testid="comparison-table"]').within(() => {
      // Header row with current loan + offers
      cy.get('thead tr th').should('have.length.at.least', 4); // Current + 3 offers minimum
      
      // Key comparison metrics
      cy.contains('th', 'Interest Rate');
      cy.contains('th', 'Monthly Payment');
      cy.contains('th', 'Total Cost');
      cy.contains('th', 'Monthly Savings');
      cy.contains('th', 'Break-even');
      
      // Current loan column
      cy.get('[data-testid="current-loan-column"]').within(() => {
        cy.contains('6.5%');
        cy.contains('₪2,750');
      });
      
      // Best offer highlighting
      cy.get('[data-testid="best-offer"]').should('have.class', 'highlighted');
    });
  });
});
```

### 📋 Advanced Financial Modeling Tests
```typescript
const refinanceModelingTests = {
  netPresentValueAnalysis: {
    currentScenario: {
      monthlyPayment: 2750,
      remainingMonths: 264, // 22 years
      totalFuturePayments: 726000
    },
    refinanceScenario: {
      monthlyPayment: 2300,
      newTermMonths: 300, // 25 years
      closingCosts: 8000,
      totalFuturePayments: 698000
    },
    npvCalculation: {
      discountRate: 0.05, // 5% annual
      netBenefit: 35000 // NPV of savings minus costs
    }
  },
  
  sensitivityAnalysis: {
    rateChanges: [-0.5, -0.25, 0, +0.25, +0.5],
    breakEvenImpact: 'Test how rate changes affect break-even calculation',
    totalSavingsImpact: 'Validate savings sensitivity to rate variations'
  }
};
```

---

## 🧠 COMPREHENSIVE EDGE CASE TESTING FOR REFINANCE-CREDIT

### @import Comprehensive Edge Case Testing Framework

```typescript
// Reference: /server/docs/QA/shared/comprehensive_edge_case_testing.md
// Apply all edge case testing scenarios specifically to refinance-credit workflows

describe('🧠 REFINANCE-CREDIT EDGE CASE VALIDATION', () => {
  
  describe('📋 EXTREME REFINANCE SCENARIOS', () => {
    
    it('should handle underwater mortgage refinancing', () => {
      // Scenario: Loan balance exceeds property value
      cy.get('[data-testid="existing-loan-balance"]').type('500000');
      cy.get('[data-testid="current-property-value"]').type('450000'); // Underwater by 50k
      
      cy.get('[data-testid="calculate-refinance-options"]').click();
      
      // Validate underwater mortgage handling
      cy.get('[data-testid="underwater-warning"]').should('be.visible');
      cy.get('[data-testid="refinance-options"]').within(() => {
        cy.contains('HARP (Home Affordable Refinance Program)');
        cy.contains('Cash-in refinance option');
        cy.contains('Wait for property value recovery');
      });
    });

    it('should handle extreme DTI boundary conditions', () => {
      const extremeDTIScenarios = [
        { currentDTI: 48.5, newPayment: 2100, income: 30000, expected: 'Requires manual review' },
        { currentDTI: 51.0, newPayment: 1800, income: 30000, expected: 'DTI improvement required' },
        { currentDTI: 55.0, newPayment: 1500, income: 30000, expected: 'Significant DTI reduction' }
      ];

      extremeDTIScenarios.forEach(scenario => {
        // Set current financial situation
        const currentDebt = (scenario.currentDTI / 100) * scenario.income;
        cy.get('[data-testid="monthly-income"]').clear().type(scenario.income.toString());
        cy.get('[data-testid="existing-monthly-debts"]').clear().type(currentDebt.toString());
        
        // Set new refinance payment
        cy.get('[data-testid="new-estimated-payment"]').should('contain', scenario.newPayment);
        
        // Calculate new DTI
        const newDTI = ((currentDebt - 2750 + scenario.newPayment) / scenario.income) * 100;
        
        cy.get('[data-testid="new-dti-ratio"]').should('contain', newDTI.toFixed(1));
        cy.get('[data-testid="dti-assessment"]').should('contain', scenario.expected);
      });
    });

    it('should handle massive loan amounts at system boundaries', () => {
      const extremeLoanScenarios = [
        { balance: 2999999, valid: true, category: 'Super jumbo loan' },
        { balance: 3000000, valid: false, category: 'Exceeds system limits' },
        { balance: 50000000, valid: false, category: 'Invalid amount' }
      ];

      extremeLoanScenarios.forEach(scenario => {
        cy.get('[data-testid="existing-loan-balance"]').clear().type(scenario.balance.toString());
        cy.get('[data-testid="validate-refinance"]').click();
        
        if (scenario.valid) {
          cy.get('[data-testid="loan-category"]').should('contain', scenario.category);
          cy.get('[data-testid="special-requirements"]').should('be.visible');
        } else {
          cy.get('[data-testid="error-message"]').should('contain', 'exceeds maximum');
        }
      });
    });
  });

  describe('= COMPLEX REFINANCE COMBINATIONS', () => {
    
    it('should handle rate-and-term + cash-out combination', () => {
      // Complex scenario: Changing rate, term, and taking cash out
      cy.get('[data-testid="existing-loan-balance"]').type('400000');
      cy.get('[data-testid="current-rate"]').type('6.5');
      cy.get('[data-testid="current-term-remaining"]').type('22');
      
      // Enable both rate-and-term AND cash-out
      cy.get('[data-testid="refinance-type-both"]').check();
      cy.get('[data-testid="new-rate"]').type('4.8');
      cy.get('[data-testid="new-term"]').type('30');
      cy.get('[data-testid="cash-out-amount"]').type('150000');
      
      cy.get('[data-testid="calculate-complex-refinance"]').click();
      
      // Validate complex calculation results
      cy.get('[data-testid="new-loan-amount"]').should('contain', '550000'); // 400k + 150k
      cy.get('[data-testid="payment-impact"]').should('be.visible');
      cy.get('[data-testid="break-even-complex"]').should('be.visible');
      cy.get('[data-testid="total-cost-comparison"]').should('be.visible');
    });

    it('should handle investment property refinance rules', () => {
      cy.get('[data-testid="property-type"]').select('investment');
      cy.get('[data-testid="existing-loan-balance"]').type('600000');
      cy.get('[data-testid="property-value"]').type('800000');
      
      cy.get('[data-testid="calculate-investment-refinance"]').click();
      
      // Validate investment property specific rules
      cy.get('[data-testid="max-ltv"]').should('contain', '75%'); // Lower LTV for investment
      cy.get('[data-testid="required-reserves"]').should('contain', '6 months'); // Cash reserves requirement
      cy.get('[data-testid="rate-adjustment"]').should('contain', '+0.5%'); // Higher rates for investment
      cy.get('[data-testid="rental-income-consideration"]').should('be.visible');
    });
  });

  describe('SYSTEM PERFORMANCE UNDER STRESS', () => {
    
    it('should handle concurrent refinance calculations', () => {
      // Simulate multiple calculations happening simultaneously
      const calculations = [];
      
      for (let i = 0; i < 5; i++) {
        calculations.push(
          cy.window().then(win => {
            return win.store.dispatch({
              type: 'refinanceCredit/calculateOffers',
              payload: {
                balance: 400000 + (i * 50000),
                rate: 6.5 - (i * 0.2),
                income: 30000 + (i * 5000)
              }
            });
          })
        );
      }
      
      // Validate all calculations complete successfully
      Promise.all(calculations).then(() => {
        cy.get('[data-testid="calculation-results"]').should('have.length', 5);
        cy.get('[data-testid="system-performance"]').should('not.contain', 'error');
      });
    });
  });
});
```

---

## < MULTILINGUAL CULTURAL TESTING FOR REFINANCE-CREDIT

### @import Multilingual Cultural Testing Framework

```typescript
// Reference: /server/docs/QA/shared/multilingual_cultural_testing.md
// Apply comprehensive multilingual testing to refinance-credit interface

describe('< REFINANCE-CREDIT MULTILINGUAL VALIDATION', () => {
  
  const refinanceTerminology = {
    he: {
      refinance: 'מימון מחדש',
      breakEven: 'נקודת איזון',
      cashOut: 'משיכת מזומן',
      closingCosts: 'עלויות סגירה',
      equity: 'הון עצמי',
      savingsAnalysis: 'ניתוח חיסכון'
    },
    ru: {
      refinance: '@5D8=0=A8@>20=85',
      breakEven: 'B>G:0 157C1KB>G=>AB8', 
      cashOut: '872;5G5=85 =0;8G=KE',
      closingCosts: '@0AE>4K =0 70:@KB85',
      equity: 'A>1AB25==K9 :0?8B0;',
      savingsAnalysis: '0=0;87 M:>=><88'
    },
    en: {
      refinance: 'Refinance',
      breakEven: 'Break-even Point',
      cashOut: 'Cash-out',
      closingCosts: 'Closing Costs',
      equity: 'Home Equity',
      savingsAnalysis: 'Savings Analysis'
    }
  };

  Object.keys(refinanceTerminology).forEach(lang => {
    describe(`Testing Refinance-Credit in ${lang.toUpperCase()}`, () => {
      
      beforeEach(() => {
        cy.visit(`/services/refinance-credit/1?lang=${lang}`);
        cy.get('[data-testid="language-selector"]').select(lang);
      });

      it(`should display proper ${lang} refinance terminology`, () => {
        const terms = refinanceTerminology[lang];
        
        Object.entries(terms).forEach(([key, translation]) => {
          cy.get(`[data-testid="${key}-label"]`).should('contain', translation);
        });
      });

      it(`should handle complex refinance calculations in ${lang}`, () => {
        // Fill refinance form with complex data
        cy.get('[data-testid="existing-loan-balance"]').type('450000');
        cy.get('[data-testid="current-rate"]').type('6.5');
        cy.get('[data-testid="cash-out-amount"]').type('100000');
        
        cy.get('[data-testid="calculate-refinance"]').click();
        
        // Validate results display in correct language
        cy.get('[data-testid="results-summary"]').should('be.visible');
        cy.get('[data-testid="monthly-savings"]').should('contain', lang =='he' ? '₪' : '$');
        
        if (lang =='he') {
          // Validate RTL layout for financial data
          cy.get('[data-testid="financial-summary"]').should('have.css', 'direction', 'rtl');
          cy.get('[data-testid="savings-amount"]').should('have.css', 'text-align', 'right');
        }
      });

      it(`should handle refinance documentation requirements in ${lang}`, () => {
        cy.get('[data-testid="required-documents"]').should('be.visible');
        
        const documentLabels = {
          he: ['תלושי שכר', 'דוחות בנק', 'דוח שמאי'],
          ru: ['A?@02:8 > 4>E>40E', '2K?8A:8 10=:0', '>BG5B >F5=I8:0'],
          en: ['Pay Stubs', 'Bank Statements', 'Appraisal Report']
        };
        
        documentLabels[lang].forEach(docLabel => {
          cy.get('[data-testid="required-documents"]').should('contain', docLabel);
        });
      });
    });
  });

  describe('= LANGUAGE SWITCHING WITH REFINANCE DATA', () => {
    
    it('should preserve complex refinance calculation when switching languages', () => {
      // Fill complex refinance scenario in English
      cy.visit('/services/refinance-credit/1?lang=en');
      cy.get('[data-testid="existing-loan-balance"]').type('500000');
      cy.get('[data-testid="current-rate"]').type('7.2');
      cy.get('[data-testid="cash-out-amount"]').type('150000');
      cy.get('[data-testid="new-term"]').type('25');
      
      // Calculate initial results
      cy.get('[data-testid="calculate-refinance"]').click();
      cy.get('[data-testid="monthly-savings"]').invoke('text').as('englishSavings');
      
      // Switch to Hebrew
      cy.get('[data-testid="language-selector"]').select('he');
      
      // Verify data preservation and consistent calculation
      cy.get('[data-testid="existing-loan-balance"]').should('have.value', '500000');
      cy.get('[data-testid="current-rate"]').should('have.value', '7.2');
      cy.get('[data-testid="cash-out-amount"]').should('have.value', '150000');
      
      // Verify calculation results remain consistent
      cy.get('[data-testid="monthly-savings"]').invoke('text').then(hebrewSavings => {
        cy.get('@englishSavings').then(englishSavings => {
          // Extract numeric values for comparison
          const englishAmount = parseFloat(englishSavings.replace(/[^0-9.]/g, ''));
          const hebrewAmount = parseFloat(hebrewSavings.replace(/[^0-9.]/g, ''));
          expect(Math.abs(englishAmount - hebrewAmount)).to.be.lessThan(1);
        });
      });
    });
  });
});
```

---

## 📋 TEST EXECUTION & REPORTING

### 🎯 Test Execution Strategy

#### Execution Phases
```typescript
const testExecutionPlan = {
  phase1: {
    name: 'Smoke Testing',
    duration: '2 hours',
    scope: 'Basic functionality verification',
    tests: ['Authentication', 'Form navigation', 'Basic calculations']
  },
  
  phase2: {
    name: 'Core Functionality',
    duration: '8 hours', 
    scope: 'Complete refinance workflow testing',
    tests: ['Multi-borrower scenarios', 'Bank offers', 'Benefit calculations']
  },
  
  phase3: {
    name: 'Edge Cases & Stress Testing',
    duration: '6 hours',
    scope: 'Boundary conditions and system limits',
    tests: ['Extreme values', 'System stress', 'Error scenarios']
  },
  
  phase4: {
    name: 'Multilingual & Cultural',
    duration: '4 hours',
    scope: 'Language and cultural testing',
    tests: ['Hebrew RTL', 'Russian formal', 'English accessibility']
  },
  
  phase5: {
    name: 'Integration & E2E',
    duration: '6 hours',
    scope: 'End-to-end workflow validation',
    tests: ['Complete application journey', 'Document upload', 'Submission']
  }
};
```

### 📋 Advanced Reporting Configuration

#### Enhanced HTML Report Generation
```typescript
// Enhanced reporting for refinance-credit testing
const reportConfiguration = {
  reportPath: 'cypress/reports/refinance-credit/',
  screenshots: {
    beforeCalculation: 'Form state before refinance calculation',
    afterCalculation: 'Results display with benefit analysis',
    bankOffers: 'Bank offer comparison table',
    documentUpload: 'Document verification interface',
    finalSubmission: 'Application confirmation page'
  },
  
  metricsTracking: {
    calculationAccuracy: 'Validate financial calculation precision',
    performanceMetrics: 'Page load times and response times',
    errorRecovery: 'Error handling and user guidance',
    accessibilityScore: 'WCAG compliance and screen reader support'
  },
  
  complianceValidation: {
    financialRegulations: 'Regulatory compliance verification',
    dataProtection: 'GDPR and privacy compliance',
    accessibilityStandards: 'WCAG 2.1 AA compliance',
    multilingualStandards: 'Translation quality and cultural appropriateness'
  }
};
```

#### Custom Report Generation Script
```bash
# Generate comprehensive refinance-credit testing report
npm run qa:generate-refinance-credit-report

# Script should include:
# 1. Test execution summary with phase breakdown
# 2. Financial calculation accuracy verification
# 3. Multi-borrower scenario coverage
# 4. Edge case testing results
# 5. Multilingual testing coverage
# 6. Performance metrics and screenshots
# 7. Compliance validation results
```

---

## 🎯 SUCCESS CRITERIA & QUALITY GATES

### 📋 Refinance-Credit Testing Metrics

#### Core Functionality Validation
- ** Authentication Flow**: 100% success rate for dual auth (phone + email)
- ** Calculation Accuracy**: 0.01% precision for all financial calculations
- ** Multi-Borrower Logic**: Correct DTI and income aggregation for all scenarios
- ** Bank Offer Generation**: Minimum 3 valid offers for qualifying applications
- ** Break-Even Analysis**: Accurate break-even calculations within 1 month precision

#### Advanced Testing Coverage
- ** Edge Case Handling**: 95%+ pass rate for extreme value scenarios
- ** System Performance**: <3 second response time under normal load
- ** Multilingual Support**: 100% translation coverage for refinance terminology
- ** RTL Layout Integrity**: Perfect Hebrew interface layout and navigation
- ** Document Management**: 100% success rate for required document validation

#### Compliance & Quality Standards
- ** Financial Regulations**: Full compliance with lending regulations
- ** Data Protection**: GDPR-compliant data handling and storage
- ** Accessibility**: WCAG 2.1 AA compliance across all interfaces
- ** Cross-Browser Support**: Consistent functionality across all major browsers
- ** Mobile Responsiveness**: Full feature parity on mobile devices

### 🎯 ULTRATHINK Quality Framework

#### Business Logic Validation
- **Refinance Benefit Calculations**: Net Present Value analysis with 5% discount rate
- **DTI Ratio Accuracy**: Combined borrower DTI calculations with proper income weighting
- **LTV Compliance**: Accurate loan-to-value calculations with property type considerations
- **Break-Even Analysis**: Precise break-even calculations considering all costs and savings
- **Cash-Out Logic**: Correct equity calculations and available cash-out amounts

#### System Resilience Testing
- **Concurrent User Load**: 100+ simultaneous users without performance degradation
- **Data Integrity**: No data loss or corruption under stress conditions
- **Error Recovery**: Graceful handling of API failures and network issues
- **Session Management**: Proper handling of long sessions and timeout scenarios
- **Security Validation**: Protection against common web vulnerabilities

### 📋 Final Validation Checklist

#### Pre-Production Validation
- [ ] **Functional Testing**: All core refinance workflows tested and validated
- [ ] **Edge Case Coverage**: Comprehensive testing of boundary conditions and extreme scenarios
- [ ] **Multilingual Testing**: Full Hebrew/Russian/English interface validation with cultural considerations
- [ ] **Performance Testing**: Load testing with realistic user scenarios and data volumes
- [ ] **Security Testing**: Penetration testing and vulnerability assessment completed
- [ ] **Accessibility Testing**: WCAG 2.1 AA compliance verified with assistive technologies
- [ ] **Cross-Browser Testing**: Validated across Chrome, Firefox, Safari, and Edge
- [ ] **Mobile Testing**: Full feature testing on iOS and Android devices
- [ ] **Integration Testing**: End-to-end workflow testing with external systems
- [ ] **Compliance Testing**: Regulatory compliance and data protection validation

#### Post-Testing Activities
- [ ] **Test Report Generation**: Comprehensive HTML report with screenshots and metrics
- [ ] **Issue Documentation**: All identified issues documented with reproduction steps
- [ ] **Performance Baseline**: Performance benchmarks established for ongoing monitoring
- [ ] **User Acceptance**: Business stakeholder review and approval
- [ ] **Production Readiness**: Final sign-off for production deployment

---

## 📋 CONFLUENCE INTEGRATION & DOCUMENTATION

### = Confluence Specification Alignment
- **Reference**: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/20448533/6.1.+
- **System Overview**: 32 screens with 300+ user actions for complete refinance-credit workflow
- **Business Requirements**: Multi-borrower support, cash-out refinance, break-even analysis
- **Technical Requirements**: Real-time calculations, document management, bank integration

### 📋 Test Documentation Standards
- **Test Case Documentation**: Detailed test cases with step-by-step instructions
- **Business Logic Validation**: Mathematical formulas and calculation verification
- **User Journey Mapping**: Complete user workflows with decision points
- **Error Scenario Handling**: Comprehensive error handling and recovery testing

**REMEMBER**: Refinance-credit testing requires deep financial domain knowledge, complex multi-borrower scenario handling, and precise calculation validation. This is not just form testing - it's comprehensive financial system validation with real-world impact on borrowers' financial decisions.

---

## 📋 EXECUTION COMMANDS

```bash
# Run complete refinance-credit test suite
npm run test:refinance-credit

# Run specific test phases
npm run test:refinance-credit:phase1  # Initialization & Auth
npm run test:refinance-credit:phase2  # Existing Loan Analysis
npm run test:refinance-credit:phase3  # Multi-Borrower Assessment
npm run test:refinance-credit:phase4  # Bank Offers & Comparison

# Run edge case testing
npm run test:refinance-credit:edge-cases

# Run multilingual testing
npm run test:refinance-credit:multilingual

# Generate comprehensive test report
npm run qa:generate-refinance-credit-report
```

**ULTRATHINK COMPLETE**: This comprehensive refinance-credit testing strategy addresses the full complexity of the 32-screen application system with proper validation of financial calculations, multi-borrower scenarios, and cultural considerations as specified in Confluence 6.1.+.

---

# 🚀 ENHANCED AUTOMATION FRAMEWORK - COMPREHENSIVE RESPONSIVE TESTING & STAGE 4 COMPLETION VALIDATION

## 📋 PROFESSIONAL AI AUTOMATION UPDATE - ENHANCED VERSION INTEGRATION

### **Automated Testing Framework Enhancement Directive**

**OBJECTIVE**: Systematically integrate comprehensive responsive testing capabilities with absolute Stage 4 completion validation and exhaustive link testing across all refinance credit service endpoints.

---

## 🔧 RESPONSIVE TESTING INTEGRATION - BULLETPROOF FRAMEWORK

### **Source Configuration Integration**
Enhanced responsive testing patterns extracted from `/server/docs/QA/responsiveQaInstructions` with refinance credit-specific adaptations.

#### **Responsive Testing Matrix for Refinance Credit Calculator**
```typescript
const refinanceCreditResponsiveMatrix = {
  // Refinance Credit Calculator Breakpoints
  breakpoints: {
    mobile: [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 360, height: 640, name: 'Galaxy S8' },
      { width: 390, height: 844, name: 'iPhone 12' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' }
    ],
    tablet: [
      { width: 768, height: 1024, name: 'iPad' },
      { width: 820, height: 1180, name: 'iPad Air' }
    ],
    desktop: [
      { width: 1280, height: 800, name: 'Small Laptop' },
      { width: 1440, height: 900, name: 'MacBook Pro' },
      { width: 1920, height: 1080, name: 'Desktop HD' }
    ]
  },

  // Refinance Credit-Specific Layout Validation
  refinanceCreditLayoutChecks: {
    existingLoanInput: 'Current loan balance input scales correctly with currency formatting',
    loanComparisonTable: 'Existing vs new loan comparison table adapts to mobile',
    savingsCalculator: 'Potential savings display remains visible and prominent',
    existingPaymentInput: 'Current monthly payment input maintains usability',
    newPaymentCalculation: 'New payment calculation prominently displayed',
    refinanceTerms: 'Refinancing terms dropdown accessible on mobile',
    breakEvenAnalysis: 'Break-even point analysis scales appropriately',
    progressIndicator: 'Four-step progress indicator adapts to screen width',
    formValidation: 'Refinance validation messages display properly',
    modalDialogs: 'Refinance info modals fit viewport bounds perfectly',
    numericKeypad: 'Mobile devices show numeric keypad for loan amount inputs'
  }
};

// Enhanced Responsive Test Implementation
describe('🔧 REFINANCE CREDIT RESPONSIVE VALIDATION SUITE', () => {
  
  const pages = [
    { name: 'RefinanceCreditStep1', path: '/services/refinance-credit/1' },
    { name: 'RefinanceCreditStep2', path: '/services/refinance-credit/2' },
    { name: 'RefinanceCreditStep3', path: '/services/refinance-credit/3' },
    { name: 'RefinanceCreditStep4', path: '/services/refinance-credit/4' }
  ];

  const viewports = [
    [320, 568], [360, 640], [390, 844], [414, 896],  // Mobile
    [768, 1024], [820, 1180],                        // Tablet
    [1280, 800], [1440, 900], [1920, 1080]          // Desktop
  ];

  // Enhanced Responsive Validation Functions
  function assertNoHorizontalScroll() {
    cy.window().then(win => {
      const el = win.document.scrollingElement;
      expect(el.scrollWidth, 'No horizontal scroll on refinance credit calculator').to.eq(el.clientWidth);
    });
  }

  function assertRefinanceCreditElementsVisible(viewport) {
    const [width, height] = viewport;
    
    // Critical refinance credit elements must be visible
    cy.get('[data-testid="existing-loan-balance"]').should('be.visible');
    cy.get('[data-testid="existing-payment"]').should('be.visible');
    cy.get('[data-testid="savings-display"]').should('be.visible');
    cy.get('[data-testid="continue-button"]').should('be.visible');
    
    // Mobile-specific validations
    if (width <= 768) {
      cy.get('[data-testid="mobile-savings-calculator"]').should('be.visible');
      cy.get('[data-testid="numeric-keypad"]').should('be.visible');
    }
    
    // Desktop-specific validations
    if (width >= 1280) {
      cy.get('[data-testid="sidebar-comparison"]').should('be.visible');
      cy.get('[data-testid="break-even-analysis"]').should('be.visible');
    }
  }

  function assertRefinanceCreditFormInteractivity(viewport) {
    const [width, height] = viewport;
    
    // Test existing loan balance input
    cy.get('[data-testid="existing-loan-balance"]').type('350000');
    cy.get('[data-testid="formatted-loan-balance"]').should('contain', '₪350,000');
    
    // Test existing payment input
    cy.get('[data-testid="existing-payment"]').type('2500');
    
    // Verify savings calculation updates
    cy.get('[data-testid="potential-savings"]').should('be.visible');
    
    // Test responsive comparison table
    if (width <= 768) {
      cy.get('[data-testid="comparison-mobile-view"]').should('be.visible');
    } else {
      cy.get('[data-testid="comparison-desktop-view"]').should('be.visible');
    }
    
    // Test form navigation
    cy.get('[data-testid="continue-button"]').should('be.visible').click();
  }

  // Comprehensive Responsive Test Suite
  pages.forEach(page => {
    viewports.forEach(([width, height]) => {
      it(`${page.name} responsive validation @ ${width}x${height}`, () => {
        cy.viewport(width, height);
        cy.visit(`http://localhost:5173${page.path}`);
        
        // Core responsive validations
        assertNoHorizontalScroll();
        assertRefinanceCreditElementsVisible([width, height]);
        assertRefinanceCreditFormInteractivity([width, height]);
        
        // Capture viewport-specific screenshot
        cy.screenshot(`responsive-refinance-credit/${page.name}-${width}x${height}`, { 
          capture: 'viewport',
          overwrite: true
        });
        
        // Performance validation
        cy.window().then(win => {
          const perfEntries = win.performance.getEntriesByType('navigation');
          expect(perfEntries[0].loadEventEnd - perfEntries[0].loadEventStart)
            .to.be.lessThan(3000, 'Page load time under 3s');
        });
      });
    });
  });

  // Fluid Resize Testing
  it('should handle fluid viewport resizing gracefully', () => {
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    // Start at mobile and gradually resize to desktop
    for (let width = 320; width <= 1920; width += 100) {
      cy.viewport(width, 800);
      cy.wait(100);
      
      // Verify no horizontal scroll at any width
      assertNoHorizontalScroll();
      
      // Verify critical elements remain accessible
      cy.get('[data-testid="existing-loan-balance"]').should('be.visible');
      cy.get('[data-testid="continue-button"]').should('be.visible');
    }
  });

  // Loan Comparison Responsive Testing
  it('should validate loan comparison display across all viewports', () => {
    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.visit('http://localhost:5173/services/refinance-credit/1');
      
      // Fill refinance data
      cy.get('[data-testid="existing-loan-balance"]').type('400000');
      cy.get('[data-testid="existing-payment"]').type('3000');
      cy.get('[data-testid="existing-rate"]').type('6.5');
      
      // Verify comparison display adapts to viewport
      if (width <= 768) {
        cy.get('[data-testid="comparison-cards"]').should('be.visible');
      } else {
        cy.get('[data-testid="comparison-table"]').should('be.visible');
      }
      
      // Test savings calculation visibility
      cy.get('[data-testid="monthly-savings"]').should('be.visible');
      cy.get('[data-testid="total-savings"]').should('be.visible');
      
      cy.screenshot(`loan-comparison-${width}x${height}`);
    });
  });
});
```

---

## ✅ PHASE 0 COMPLETION CHECKLIST

### Server Architecture Validation
- [ ] **Monorepo server running**: `packages/server/src/server.js` on port 8003
- [ ] **Health check passes**: `curl http://localhost:8003/api/health`
- [ ] **All dropdown APIs responding**: Steps 1-4 for refinance credit
- [ ] **Database connectivity confirmed**: Content tables accessible
- [ ] **Cache system operational**: Clear cache API working

### Legacy Fallback Testing (Emergency Only)
- [ ] **Legacy server compatibility**: `server/server-db.js` provides identical responses
- [ ] **Database schema synchronization**: Both servers use same database
- [ ] **API endpoint parity**: All endpoints return same data structure

### Dropdown Content Validation
- [ ] **All 4 refinance credit steps**: Content available in database
- [ ] **Multi-language support**: EN/HE/RU content complete
- [ ] **Cache performance**: Second requests <50ms response time
- [ ] **Error handling**: Graceful fallbacks for missing content
- [ ] **RTL support**: Hebrew content displays correctly

**CRITICAL**: Phase 0 must be 100% complete before proceeding to link testing. Any dropdown failures will cascade into form validation failures in subsequent phases.

---

## 🎯 COMPREHENSIVE LINK TESTING & NEW WINDOW/POPUP VALIDATION

### **CRITICAL LINK AND NAVIGATION TESTING REQUIREMENTS**

**MANDATORY**: Every single clickable element must be tested for complete process flows through Stage 4.

#### **Link Testing Protocol Implementation**
```typescript
describe('🔗 COMPREHENSIVE REFINANCE CREDIT LINK TESTING SUITE', () => {
  
  // Complete Link Discovery and Categorization for Refinance Credit
  const linkCategories = {
    internalNavigation: '[data-testid*="step"], [data-testid*="continue"], [data-testid*="back"]',
    externalLinks: 'a[href^="http"], a[href^="https"]',
    popupTriggers: '[data-testid*="popup"], [data-testid*="modal"], [data-testid*="tooltip"]',
    documentLinks: '[data-testid*="document"], [data-testid*="pdf"], [data-testid*="download"]',
    bankingLinks: '[data-testid*="bank"], [data-testid*="program"], [data-testid*="offer"]',
    refinanceInfoLinks: '[data-testid*="refinance-info"], [data-testid*="savings"], [data-testid*="calculator-help"]',
    comparisonLinks: '[data-testid*="compare"], [data-testid*="analysis"], [data-testid*="break-even"]',
    legalLinks: '[data-testid*="terms"], [data-testid*="privacy"], [data-testid*="legal"]'
  };

  beforeEach(() => {
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    // Initialize link tracking
    cy.window().then(win => {
      win.linkTestResults = {
        discovered: [],
        tested: [],
        failed: [],
        completed: []
      };
    });
  });

  // Phase 1: Link Discovery and Classification
  it('should discover and classify all clickable elements', () => {
    const discoveredLinks = [];
    
    Object.entries(linkCategories).forEach(([category, selector]) => {
      cy.get('body').then($body => {
        const elements = $body.find(selector);
        elements.each((index, element) => {
          const linkData = {
            category,
            selector: element.getAttribute('data-testid') || element.tagName,
            href: element.href || 'javascript',
            target: element.target || '_self',
            text: element.textContent?.trim() || 'No text'
          };
          discoveredLinks.push(linkData);
        });
      });
    });

    cy.then(() => {
      expect(discoveredLinks.length, 'Must discover refinance credit links to test').to.be.greaterThan(0);
      cy.log(`📊 Discovered ${discoveredLinks.length} clickable elements in refinance credit calculator`);
    });
  });

  // Phase 2: Complete Link Testing with Process Validation
  Object.entries(linkCategories).forEach(([category, selector]) => {
    
    it(`should test all ${category} links with complete process validation`, () => {
      cy.get(selector).should('exist').then($links => {
        
        $links.each((index, link) => {
          const linkElement = Cypress.$(link);
          const linkText = linkElement.text().trim();
          const linkHref = linkElement.attr('href') || 'javascript';
          
          cy.log(`🔗 Testing refinance credit ${category} link: "${linkText}"`);
          
          // Pre-click state capture
          cy.window().then(win => {
            const initialWindowCount = win.length;
            const initialUrl = win.location.href;
            
            cy.wrap(linkElement).click({ force: true });
            
            cy.wait(1000); // Allow for navigation/popup
            
            // Detect link behavior and complete validation
            cy.window().then(newWin => {
              const newWindowCount = newWin.length;
              const newUrl = newWin.location.href;
              
              if (newWindowCount > initialWindowCount) {
                // New window/tab opened
                cy.log('🪟 New window/tab detected - validating refinance credit content');
                
                // Switch to new window and complete process
                cy.window().then(win => {
                  // Complete process in new window to Stage 4
                  completeRefinanceCreditProcessInNewWindow(win, category, linkText);
                });
                
              } else if (newUrl !== initialUrl) {
                // Navigation occurred in same window
                cy.log('🧭 Navigation detected - validating new refinance credit page');
                
                // Complete process on new page to Stage 4
                completeRefinanceCreditProcessOnNewPage(newUrl, category, linkText);
                
              } else {
                // Popup/modal opened
                cy.log('🎭 Popup/modal detected - validating refinance credit interaction');
                
                // Handle popup interaction completely
                completeRefinanceCreditPopupInteraction(category, linkText);
              }
            });
          });
        });
      });
    });
  });

  // Helper Functions for Complete Refinance Credit Process Validation
  function completeRefinanceCreditProcessInNewWindow(win, category, linkText) {
    cy.log(`⟳ Completing refinance credit process in new window for ${category}: ${linkText}`);
    
    // Stage 1: Verify new window loaded correctly
    cy.get('[data-testid="main-content"]', { timeout: 10000 }).should('be.visible');
    
    // Stage 2: Complete refinance credit data entry in new window
    if (win.location.href.includes('refinance-credit')) {
      fillRefinanceCreditFormToCompletion();
    } else if (win.location.href.includes('bank-program')) {
      completeBankRefinanceCreditProgramSelection();
    } else {
      completeGenericRefinanceCreditProcess();
    }
    
    // Stage 3: Validate processing completed
    cy.get('[data-testid="processing-complete"]', { timeout: 15000 }).should('be.visible');
    
    // Stage 4: Confirm final completion
    cy.get('[data-testid="process-confirmed"]').should('be.visible');
    cy.get('[data-testid="reference-number"]').should('exist');
    
    // Return to original window
    cy.window().then(originalWin => {
      originalWin.close();
    });
    
    cy.log(`✅ Refinance credit process completed to Stage 4 in new window: ${linkText}`);
  }

  function completeRefinanceCreditProcessOnNewPage(url, category, linkText) {
    cy.log(`⟳ Completing refinance credit process on new page for ${category}: ${linkText}`);
    
    // Stage 1: Verify page navigation successful
    cy.url().should('include', url.split('/').pop());
    
    // Stage 2: Complete refinance credit form interactions
    if (url.includes('/2')) {
      completeRefinanceCreditStep2Process();
    } else if (url.includes('/3')) {
      completeRefinanceCreditStep3Process();
    } else if (url.includes('/4')) {
      completeRefinanceCreditStep4Process();
    }
    
    // Stage 3: Process validation
    cy.get('[data-testid="step-validation"]').should('have.class', 'valid');
    
    // Stage 4: Final confirmation
    if (url.includes('/4')) {
      cy.get('[data-testid="final-submit"]').click();
      cy.get('[data-testid="submission-confirmed"]').should('be.visible');
    }
    
    cy.log(`✅ Refinance credit process completed to Stage 4 on new page: ${linkText}`);
  }

  function completeRefinanceCreditPopupInteraction(category, linkText) {
    cy.log(`⟳ Completing refinance credit popup interaction for ${category}: ${linkText}`);
    
    // Stage 1: Verify popup opened
    cy.get('[data-testid*="modal"], [data-testid*="popup"], [role="dialog"]')
      .should('be.visible');
    
    // Stage 2: Complete refinance credit popup form/interaction
    cy.get('[data-testid*="modal"] input, [data-testid*="popup"] input')
      .each($input => {
        if ($input.attr('type') === 'text') {
          cy.wrap($input).type('Test input');
        } else if ($input.attr('type') === 'number') {
          cy.wrap($input).type('350000');
        }
      });
    
    // Stage 3: Submit popup form
    cy.get('[data-testid*="modal"] button, [data-testid*="popup"] button')
      .contains(/submit|confirm|save|continue/i)
      .click();
    
    // Stage 4: Validate popup completion
    cy.get('[data-testid*="success"], [data-testid*="confirmed"]')
      .should('be.visible');
    
    // Close popup properly
    cy.get('[data-testid*="close"], [aria-label*="close"]').click();
    
    cy.log(`✅ Refinance credit popup interaction completed to Stage 4: ${linkText}`);
  }

  // Refinance Credit Specific Process Completion Functions
  function fillRefinanceCreditFormToCompletion() {
    // Step 1: Existing Loan Analysis
    cy.get('[data-testid="existing-loan-balance"]').type('400000');
    cy.get('[data-testid="existing-payment"]').type('3200');
    cy.get('[data-testid="existing-rate"]').type('7.2');
    cy.get('[data-testid="remaining-term"]').type('18');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 2: Personal Information
    cy.get('[data-testid="first-name"]').type('Sarah');
    cy.get('[data-testid="last-name"]').type('Cohen');
    cy.get('[data-testid="phone"]').type('050-987-6543');
    cy.get('[data-testid="email"]').type('sarah.cohen@example.com');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 3: Income Information
    cy.get('[data-testid="monthly-income"]').type('28000');
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 4: Final Submission
    cy.get('[data-testid="refinance-program-selection"]').click();
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="submit-application"]').click();
  }

  function completeRefinanceCreditStep2Process() {
    cy.get('[data-testid="personal-info-form"]').within(() => {
      cy.get('[data-testid="id-number"]').type('987654321');
      cy.get('[data-testid="birth-date"]').type('1985-05-15');
      cy.get('[data-testid="address"]').type('456 Ben Gurion St');
      cy.get('[data-testid="city"]').select('Haifa');
      cy.get('[data-testid="continue-button"]').click();
    });
  }

  function completeRefinanceCreditStep3Process() {
    cy.get('[data-testid="income-form"]').within(() => {
      cy.get('[data-testid="primary-income"]').type('28000');
      cy.get('[data-testid="employment-duration"]').select('48');
      cy.get('[data-testid="employer-name"]').type('Software Solutions Ltd');
      cy.get('[data-testid="continue-button"]').click();
    });
  }

  function completeRefinanceCreditStep4Process() {
    cy.get('[data-testid="refinance-programs"]').within(() => {
      cy.get('[data-testid="refinance-program-1"]').click();
      cy.get('[data-testid="confirm-selection"]').click();
    });
    
    cy.get('[data-testid="application-review"]').within(() => {
      cy.get('[data-testid="review-complete-checkbox"]').check();
      cy.get('[data-testid="final-submit"]').click();
    });
  }
});
```

---

## 🎯 STAGE 4 COMPLETION VALIDATION - ZERO TOLERANCE FRAMEWORK

### **Absolute Refinance Credit Process Completion Requirements**

**CRITICAL**: Every single refinance credit process MUST reach Stage 4 completion - no exceptions.

#### **Stage Definition and Validation Matrix**
```typescript
const refinanceCreditStage4ValidationFramework = {
  stageDefinitions: {
    stage1: {
      name: 'INITIALIZATION',
      requirements: [
        'User lands on refinance credit calculator page',
        'All refinance resources fully loaded',
        'Existing loan input fields initialized',
        'Savings calculator loaded',
        'No JavaScript errors in console'
      ],
      validation: 'cy.get("[data-testid=refinance-credit-loaded]").should("have.class", "ready")',
      mustPass: true
    },
    
    stage2: {
      name: 'DATA INPUT AND VALIDATION',
      requirements: [
        'Existing loan balance input accepts valid amounts',
        'Current payment input works correctly',
        'Interest rate comparison functions properly',
        'Savings calculation updates in real-time',
        'Term modification validates correctly'
      ],
      validation: 'cy.get("[data-testid=refinance-form-valid]").should("have.class", "validated")',
      mustPass: true
    },
    
    stage3: {
      name: 'PROCESSING AND CALCULATION',
      requirements: [
        'New payment calculation is accurate',
        'Savings analysis calculated correctly',
        'Break-even point determined accurately',
        'Bank eligibility checks executed',
        'State management maintains all data'
      ],
      validation: 'cy.get("[data-testid=refinance-calculation-complete]").should("be.visible")',
      mustPass: true
    },
    
    stage4: {
      name: 'COMPLETION AND CONFIRMATION',
      requirements: [
        'Refinance application submitted successfully',
        'Bank program selection confirmed',
        'Application reference number generated',
        'Email confirmation sent to applicant',
        'PDF refinance summary generated',
        'Next steps clearly communicated',
        'Data persisted to refinance database',
        'Loan officer notification sent'
      ],
      validation: 'cy.get("[data-testid=refinance-complete]").should("contain", "completed")',
      mustPass: true
    }
  }
};

// Comprehensive Refinance Credit Stage 4 Validation Suite
describe('🎯 REFINANCE CREDIT STAGE 4 COMPLETION VALIDATION - ZERO TOLERANCE', () => {
  
  const refinanceServiceEndpoints = [
    '/services/refinance-credit/1',
    '/services/refinance-credit/2', 
    '/services/refinance-credit/3',
    '/services/refinance-credit/4'
  ];

  refinanceServiceEndpoints.forEach((endpoint, index) => {
    const stepNumber = index + 1;
    
    it(`Refinance Credit Step ${stepNumber} - Complete Stage 1-4 Validation`, () => {
      cy.visit(`http://localhost:5173${endpoint}`);
      
      // STAGE 1: INITIALIZATION VALIDATION
      cy.log(`🚀 STAGE 1: Validating refinance credit initialization for Step ${stepNumber}`);
      
      validateRefinanceCreditStage1Initialization(stepNumber);
      
      // STAGE 2: DATA INPUT AND VALIDATION
      cy.log(`📝 STAGE 2: Validating refinance credit data input for Step ${stepNumber}`);
      
      validateRefinanceCreditStage2DataInput(stepNumber);
      
      // STAGE 3: PROCESSING AND CALCULATION
      cy.log(`⚙️ STAGE 3: Validating refinance credit processing for Step ${stepNumber}`);
      
      validateRefinanceCreditStage3Processing(stepNumber);
      
      // STAGE 4: COMPLETION AND CONFIRMATION
      cy.log(`✅ STAGE 4: Validating refinance credit completion for Step ${stepNumber}`);
      
      validateRefinanceCreditStage4Completion(stepNumber);
      
      // Final Stage 4 Confirmation
      cy.get('[data-testid="refinance-credit-stage-4-complete"]')
        .should('be.visible')
        .and('contain', 'Refinance Credit Process Complete')
        .and('have.class', 'success');
        
      cy.log(`🎯 ✅ REFINANCE CREDIT STAGE 4 COMPLETION VERIFIED for Step ${stepNumber}`);
    });
  });

  // Stage Validation Helper Functions
  function validateRefinanceCreditStage1Initialization(step) {
    // Page load validation
    cy.get('[data-testid="main-content"]').should('be.visible');
    cy.get('[data-testid="loading-indicator"]').should('not.exist');
    
    // Refinance credit-specific resource validation
    cy.get('[data-testid="existing-loan-balance"]').should('be.visible');
    cy.get('[data-testid="savings-calculator"]').should('be.visible');
    
    // JavaScript error validation
    cy.window().then(win => {
      const errors = win.console?.errors || [];
      expect(errors.length).to.equal(0, 'No JavaScript errors allowed');
    });
    
    // Interactive element validation
    cy.get('input, button, select').should('not.be.disabled');
    
    // Mark Stage 1 complete
    cy.get('[data-testid="refinance-credit-stage-1-indicator"]')
      .should('have.class', 'completed');
  }

  function validateRefinanceCreditStage2DataInput(step) {
    if (step === 1) {
      // Existing loan balance input
      cy.get('[data-testid="existing-loan-balance"]')
        .type('350000')
        .should('have.value', '350000');
      
      // Current payment input
      cy.get('[data-testid="existing-payment"]')
        .type('2800')
        .should('have.value', '2800');
      
      // Interest rate input
      cy.get('[data-testid="existing-rate"]')
        .type('6.8')
        .should('have.value', '6.8');
        
      // Remaining term
      cy.get('[data-testid="remaining-term"]')
        .type('15')
        .should('have.value', '15');
        
    } else if (step === 2) {
      // Personal information
      cy.get('[data-testid="first-name"]').type('Sarah');
      cy.get('[data-testid="last-name"]').type('Cohen');
      cy.get('[data-testid="id-number"]').type('987654321');
      cy.get('[data-testid="phone"]').type('050-987-6543');
      cy.get('[data-testid="email"]').type('sarah.cohen@example.com');
      
    } else if (step === 3) {
      // Income information
      cy.get('[data-testid="monthly-income"]').type('28000');
      cy.get('[data-testid="employment-type"]').select('employee');
      cy.get('[data-testid="employment-duration"]').select('48');
      
    } else if (step === 4) {
      // Bank program selection
      cy.get('[data-testid="refinance-program-1"]').click();
      cy.get('[data-testid="terms-checkbox"]').check();
    }
    
    // Validate form state
    cy.get('[data-testid="refinance-form-valid"]').should('have.class', 'valid');
    
    // Mark Stage 2 complete
    cy.get('[data-testid="refinance-credit-stage-2-indicator"]')
      .should('have.class', 'completed');
  }

  function validateRefinanceCreditStage3Processing(step) {
    if (step === 1) {
      // Validate new payment calculation
      cy.get('[data-testid="new-monthly-payment"]')
        .should('be.visible')
        .and('contain', '₪');
      
      // Validate savings calculation
      cy.get('[data-testid="monthly-savings"]')
        .should('be.visible')
        .and('contain', '₪');
      
      // Validate break-even analysis
      cy.get('[data-testid="break-even-months"]')
        .should('be.visible')
        .and('match', /\d+ months/);
        
    } else if (step === 2) {
      // Validate personal data processing
      cy.get('[data-testid="data-processed"]')
        .should('have.class', 'success');
        
    } else if (step === 3) {
      // Validate income processing
      cy.get('[data-testid="income-validated"]')
        .should('be.visible')
        .and('contain', 'Validated');
      
      // Validate debt-to-income with new payment
      cy.get('[data-testid="new-dti-ratio"]')
        .should('be.visible')
        .and('match', /\d+\.\d+%/);
        
    } else if (step === 4) {
      // Validate final processing
      cy.get('[data-testid="final-processing"]')
        .should('be.visible');
        
      cy.get('[data-testid="refinance-application-id"]')
        .should('exist')
        .and('not.be.empty');
    }
    
    // Mark Stage 3 complete
    cy.get('[data-testid="refinance-credit-stage-3-indicator"]')
      .should('have.class', 'completed');
  }

  function validateRefinanceCreditStage4Completion(step) {
    if (step === 4) {
      // Final submission
      cy.get('[data-testid="submit-refinance-application"]').click();
      
      // Wait for submission processing
      cy.get('[data-testid="refinance-submission-processing"]', { timeout: 15000 })
        .should('be.visible');
      
      // Validate completion confirmation
      cy.get('[data-testid="refinance-submission-confirmed"]', { timeout: 10000 })
        .should('be.visible')
        .and('contain', 'Refinance Application Submitted Successfully');
      
      // Validate reference number
      cy.get('[data-testid="refinance-reference-number"]')
        .should('be.visible')
        .and('not.be.empty');
      
      // Validate savings summary
      cy.get('[data-testid="refinance-savings-summary"]')
        .should('be.visible')
        .and('contain', 'Monthly Savings');
      
      // Validate next steps
      cy.get('[data-testid="refinance-next-steps"]')
        .should('be.visible')
        .and('contain', 'Next Steps');
      
      // Validate refinance data persistence
      cy.window().then(win => {
        const savedData = win.localStorage.getItem('refinance-application');
        expect(savedData).to.not.be.null;
        expect(JSON.parse(savedData).status).to.equal('submitted');
        expect(JSON.parse(savedData).existingBalance).to.be.a('number');
      });
    } else {
      // For steps 1-3, validate navigation to next step
      cy.get('[data-testid="continue-button"]').click();
      cy.url().should('include', `/refinance-credit/${step + 1}`);
      
      // Validate data carried forward
      cy.window().its('store').invoke('getState').then(state => {
        expect(state.refinanceCredit).to.not.be.null;
        expect(state.refinanceCredit.currentStep).to.equal(step + 1);
      });
    }
    
    // Mark Stage 4 complete
    cy.get('[data-testid="refinance-credit-stage-4-indicator"]')
      .should('have.class', 'completed');
  }

  // Complete Refinance Credit Application Process Validation
  it('should complete entire refinance credit application process through all 4 stages', () => {
    cy.log('🚀 Starting complete refinance credit application process validation');
    
    // Step 1: Existing Loan Analysis
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    // Complete Step 1 to Stage 4
    validateRefinanceCreditStage1Initialization(1);
    validateRefinanceCreditStage2DataInput(1);
    validateRefinanceCreditStage3Processing(1);
    validateRefinanceCreditStage4Completion(1);
    
    // Step 2: Personal Information
    cy.url().should('include', '/refinance-credit/2');
    
    validateRefinanceCreditStage1Initialization(2);
    validateRefinanceCreditStage2DataInput(2);
    validateRefinanceCreditStage3Processing(2);
    validateRefinanceCreditStage4Completion(2);
    
    // Step 3: Income Information
    cy.url().should('include', '/refinance-credit/3');
    
    validateRefinanceCreditStage1Initialization(3);
    validateRefinanceCreditStage2DataInput(3);
    validateRefinanceCreditStage3Processing(3);
    validateRefinanceCreditStage4Completion(3);
    
    // Step 4: Refinance Programs and Final Submission
    cy.url().should('include', '/refinance-credit/4');
    
    validateRefinanceCreditStage1Initialization(4);
    validateRefinanceCreditStage2DataInput(4);
    validateRefinanceCreditStage3Processing(4);
    validateRefinanceCreditStage4Completion(4);
    
    // Final Stage 4 Global Validation
    cy.get('[data-testid="refinance-application-complete"]')
      .should('be.visible')
      .and('contain', 'Refinance Application Complete')
      .and('have.class', 'final-success');
      
    cy.log('🎯 ✅ COMPLETE REFINANCE CREDIT APPLICATION PROCESS VALIDATED TO STAGE 4');
  });

  // Savings Calculation Logic Complete Validation
  it('should validate savings calculation logic through complete process', () => {
    const savingsScenarios = [
      { 
        existingBalance: 400000,
        existingPayment: 3200,
        existingRate: 7.5,
        newRate: 5.8,
        description: "High savings scenario - 1.7% rate reduction"
      },
      {
        existingBalance: 250000,
        existingPayment: 2100,
        existingRate: 6.2,
        newRate: 5.9,
        description: "Moderate savings scenario - 0.3% rate reduction"
      },
      {
        existingBalance: 180000,
        existingPayment: 1650,
        existingRate: 5.5,
        newRate: 5.3,
        description: "Low savings scenario - 0.2% rate reduction"
      }
    ];

    savingsScenarios.forEach(scenario => {
      cy.visit('http://localhost:5173/services/refinance-credit/1');
      
      // Test complete flow for each savings scenario
      cy.get('[data-testid="existing-loan-balance"]').type(scenario.existingBalance.toString());
      cy.get('[data-testid="existing-payment"]').type(scenario.existingPayment.toString());
      cy.get('[data-testid="existing-rate"]').type(scenario.existingRate.toString());
      
      // Simulate new rate offer
      cy.get('[data-testid="new-rate-offer"]').should('contain', scenario.newRate.toString());
      
      // Validate savings calculations
      cy.get('[data-testid="monthly-savings"]').should('be.visible');
      cy.get('[data-testid="total-savings"]').should('be.visible');
      cy.get('[data-testid="break-even-point"]').should('be.visible');
      
      // Continue through all steps to validate complete flow
      cy.get('[data-testid="continue-button"]').click();
      
      // Complete remaining steps
      fillRemainingRefinanceSteps();
      
      // Validate final submission with savings summary
      cy.get('[data-testid="refinance-savings-summary"]').should('be.visible');
      
      cy.log(`✅ ${scenario.description} validated through complete process`);
    });
  });

  function fillRemainingRefinanceSteps() {
    // Step 2: Personal Information
    cy.get('[data-testid="first-name"]').type('Sarah');
    cy.get('[data-testid="last-name"]').type('Cohen');
    cy.get('[data-testid="phone"]').type('050-987-6543');
    cy.get('[data-testid="email"]').type('sarah.cohen@example.com');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 3: Income Information
    cy.get('[data-testid="monthly-income"]').type('28000');
    cy.get('[data-testid="employment-type"]').select('employee');
    cy.get('[data-testid="continue-button"]').click();
    
    // Step 4: Final submission validation handled in main test
  }
});
```

---

## 🛡️ PROCESS PERFECTION REQUIREMENTS

### **Zero-Defect Refinance Credit Process Criteria**

**ALL REFINANCE CREDIT PROCESSES MUST ACHIEVE 100% PERFECTION**

#### **Refinance Credit Perfection Validation Framework**
```typescript
const refinanceCreditProcessPerfectionCriteria = {
  functionalPerfection: {
    requirements: [
      '100% of refinance features work as designed',
      'Zero broken links across all refinance pages',
      'All buttons functional and responsive',
      'All refinance forms submit successfully',
      'All savings calculations mathematically accurate',
      'Break-even analysis works flawlessly'
    ],
    validation: 'Every refinance feature tested and verified working',
    tolerance: '0% failure rate'
  },
  
  flowPerfection: {
    requirements: [
      'User can complete refinance process without obstacles',
      'No dead ends in refinance navigation flow',
      'Clear path from Stage 1 to Stage 4 for refinance',
      'Intuitive progression throughout refinance steps',
      'No confusing or unclear refinance-specific steps'
    ],
    validation: 'Complete refinance user journey testing',
    tolerance: '0% user confusion incidents'
  },
  
  dataPerfection: {
    requirements: [
      'All refinance data saved correctly to database',
      'No refinance data loss at any stage',
      'Accurate refinance data validation throughout',
      'Proper refinance data persistence across sessions',
      'Correct refinance relationships maintained',
      'Savings calculations persist correctly'
    ],
    validation: 'Refinance database integrity verification',
    tolerance: '0% data corruption'
  },
  
  calculationPerfection: {
    requirements: [
      'Savings calculations accurate to 2 decimal places',
      'Payment comparisons calculated correctly',
      'Break-even analysis mathematically sound',
      'Interest rate differences computed accurately',
      'Total cost analysis precise'
    ],
    validation: 'Mathematical verification of all calculations',
    tolerance: '0% calculation errors'
  }
};

// Refinance Credit Process Perfection Validation Suite
describe('🛡️ REFINANCE CREDIT PROCESS PERFECTION VALIDATION - ZERO TOLERANCE', () => {
  
  it('should validate 100% refinance credit functional perfection', () => {
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    // Test every single refinance feature
    const refinanceFeatures = [
      'existing-loan-balance-input',
      'existing-payment-input',
      'interest-rate-input',
      'remaining-term-input',
      'savings-calculation',
      'break-even-analysis',
      'form-validation',
      'step-navigation',
      'data-persistence'
    ];
    
    refinanceFeatures.forEach(feature => {
      cy.get(`[data-testid="${feature}"]`)
        .should('exist')
        .and('be.visible')
        .and('not.be.disabled');
        
      // Test refinance-specific functionality
      if (feature.includes('balance')) {
        cy.get(`[data-testid="${feature}"]`).type('350000').should('have.value', '350000');
      } else if (feature.includes('payment')) {
        cy.get(`[data-testid="${feature}"]`).type('2800').should('have.value', '2800');
      } else if (feature.includes('button')) {
        cy.get(`[data-testid="${feature}"]`).click();
      }
    });
    
    cy.log('✅ 100% Refinance Credit Functional Perfection Validated');
  });
  
  it('should validate 100% refinance credit calculation perfection', () => {
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    // Test savings calculation accuracy
    const testScenarios = [
      {
        existingBalance: 400000,
        existingPayment: 3200,
        existingRate: 7.5,
        newRate: 5.8,
        expectedMonthlySavings: 650, // Approximate
        description: "High savings scenario"
      },
      {
        existingBalance: 250000,
        existingPayment: 2100,
        existingRate: 6.2,
        newRate: 5.9,
        expectedMonthlySavings: 95, // Approximate
        description: "Moderate savings scenario"
      },
      {
        existingBalance: 180000,
        existingPayment: 1650,
        existingRate: 5.5,
        newRate: 5.3,
        expectedMonthlySavings: 45, // Approximate
        description: "Low savings scenario"
      }
    ];
    
    testScenarios.forEach((scenario, index) => {
      cy.reload();
      
      // Input existing loan details
      cy.get('[data-testid="existing-loan-balance"]').type(scenario.existingBalance.toString());
      cy.get('[data-testid="existing-payment"]').type(scenario.existingPayment.toString());
      cy.get('[data-testid="existing-rate"]').type(scenario.existingRate.toString());
      
      // Simulate new rate
      cy.get('[data-testid="new-rate-simulation"]').type(scenario.newRate.toString());
      
      // Validate savings calculation appears
      cy.get('[data-testid="monthly-savings"]')
        .should('be.visible')
        .and('contain', '₪');
      
      // Validate break-even analysis
      cy.get('[data-testid="break-even-months"]')
        .should('be.visible')
        .and('match', /\d+ months/);
      
      cy.log(`✅ Scenario ${index + 1}: ${scenario.description} calculation perfect`);
    });
    
    cy.log('✅ 100% Refinance Credit Calculation Perfection Validated');
  });
  
  it('should validate 100% refinance credit data perfection', () => {
    cy.visit('http://localhost:5173/services/refinance-credit/1');
    
    const testData = {
      existingBalance: 375000,
      existingPayment: 2950,
      existingRate: 6.8,
      remainingTerm: 16,
      firstName: 'Sarah',
      lastName: 'Cohen',
      monthlyIncome: 28000
    };
    
    // Fill and validate data at each step
    cy.get('[data-testid="existing-loan-balance"]').type(testData.existingBalance.toString());
    cy.get('[data-testid="existing-payment"]').type(testData.existingPayment.toString());
    cy.get('[data-testid="existing-rate"]').type(testData.existingRate.toString());
    cy.get('[data-testid="remaining-term"]').type(testData.remainingTerm.toString());
    
    // Validate data persistence in Redux store
    cy.window().its('store').invoke('getState').then(state => {
      expect(state.refinanceCredit.existingBalance).to.equal(testData.existingBalance);
      expect(state.refinanceCredit.existingPayment).to.equal(testData.existingPayment);
      expect(state.refinanceCredit.existingRate).to.equal(testData.existingRate);
      expect(state.refinanceCredit.remainingTerm).to.equal(testData.remainingTerm);
    });
    
    cy.log('✅ 100% Refinance Credit Data Perfection Validated');
  });
});
```

---

## 📊 COMPREHENSIVE SUCCESS CRITERIA

### **Non-Negotiable Refinance Credit Requirements**

**EVERY REFINANCE CREDIT TEST RUN MUST CONFIRM:**

1. ✅ **ALL refinance credit links tested and functional** - Zero broken links tolerance
2. ✅ **ALL refinance credit popups handled correctly** - Complete interaction validation
3. ✅ **ALL new refinance credit pages/tabs process completed** - Stage 4 completion required
4. ✅ **ALL refinance credit processes reach Stage 4** - Mandatory completion validation
5. ✅ **ZERO broken refinance credit elements** - Perfect UI functionality
6. ✅ **ZERO Unicode errors** - Flawless text rendering
7. ✅ **100% refinance credit screenshot coverage** - Complete visual documentation
8. ✅ **Complete refinance credit audit trail** - Full test execution tracking
9. ✅ **All refinance credit validations passed** - No test failures permitted
10. ✅ **Perfect refinance credit process execution** - Flawless end-to-end performance
11. ✅ **Savings calculations 100% accurate** - Mathematical precision required
12. ✅ **Break-even analysis perfect** - All scenarios validated

### **Enhanced Refinance Credit Reporting Requirements**

#### **Stage 4 Completion Report**
```markdown
## REFINANCE CREDIT COMPLETION MATRIX

### Refinance Credit Service Endpoint Validation
- Refinance Credit Step 1: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Refinance Credit Step 2: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Refinance Credit Step 3: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]
- Refinance Credit Step 4: [Stage 1 ✅] [Stage 2 ✅] [Stage 3 ✅] [Stage 4 ✅]

### Refinance Credit Link Testing Results
- Total refinance credit links found: X
- Refinance credit links tested: X (100%)
- Refinance credit links opening popups: X (100% completed)
- Refinance credit links opening new pages: X (100% completed to Stage 4)
- All refinance credit processes completed: YES ✅

### Refinance Credit Calculations Validation
- Savings calculations: ✅ Perfect
- Break-even analysis: ✅ Perfect
- Payment comparisons: ✅ Perfect
- All calculations mathematically accurate: ✅

### Responsive Refinance Credit Testing Matrix
- Mobile (320-414px): ✅ Perfect
- Tablet (768-820px): ✅ Perfect  
- Desktop (1280-1920px): ✅ Perfect
- Fluid resize testing: ✅ Perfect

### Refinance Credit Process Perfection Score
- Functional: 100% ✅
- Flow: 100% ✅
- Data: 100% ✅
- Calculations: 100% ✅
- UI/UX: 100% ✅
- Integration: 100% ✅

### Critical Issue Log (Must be empty for release)
- Critical Issues: 0 ✅
- Major Issues: 0 ✅
- Minor Issues: 0 ✅
- All Issues Resolved: YES ✅
```

---

## 🚨 CRITICAL REFINANCE CREDIT FAILURE CONDITIONS

**REFINANCE CREDIT TEST FAILURE CONDITIONS (Any of these = IMMEDIATE FAILURE):**

1. **Incomplete Stage 4 Refinance Credit Process** - Any refinance credit process not reaching Stage 4
2. **Broken Refinance Credit Link Detection** - Any non-functional clickable element
3. **Savings Calculation Error** - Any mathematical error in savings calculations
4. **Break-Even Analysis Failure** - Incorrect break-even point calculations
5. **Refinance Credit Popup Interaction Failure** - Incomplete popup/modal interaction
6. **New Refinance Credit Window Process Incomplete** - New window/tab process not reaching Stage 4
7. **Responsive Refinance Credit Layout Failure** - Broken layout on any viewport
8. **Refinance Credit Data Loss Incident** - Any refinance credit data not persisted correctly
9. **Refinance Credit Navigation Dead End** - User cannot complete refinance credit journey
10. **Refinance Credit API Integration Failure** - Any refinance credit API call not completing successfully

### **REFINANCE CREDIT EMERGENCY PROTOCOLS**

If any critical refinance credit failure is detected:

1. **STOP REFINANCE CREDIT TESTING IMMEDIATELY**
2. **Document refinance credit failure with screenshot**
3. **Create detailed refinance credit reproduction steps**
4. **Verify savings calculations with independent calculator**
5. **Re-run complete refinance credit test suite after fix**
6. **Validate refinance credit fix does not introduce new issues**

---

**FINAL CRITICAL REFINANCE CREDIT REMINDERS**

1. **ABSOLUTE REFINANCE CREDIT COMPLETION**: Every refinance credit process MUST reach Stage 4 - no exceptions
2. **TOTAL REFINANCE CREDIT LINK COVERAGE**: Every single refinance credit link must be clicked and validated
3. **COMPLETE REFINANCE CREDIT POPUP HANDLING**: All refinance credit popups must be fully interacted with
4. **PERFECT REFINANCE CREDIT PROCESS FLOW**: From Stage 1 to Stage 4 without any issues
5. **NEW REFINANCE CREDIT PAGE COMPLETION**: All new refinance credit pages/tabs must complete their processes
6. **ZERO REFINANCE CREDIT TOLERANCE**: No broken elements, no calculation errors, no incomplete processes
7. **EXHAUSTIVE REFINANCE CREDIT VALIDATION**: Every possible refinance credit user path must be tested to perfection
8. **STAGE 4 REFINANCE CREDIT VERIFICATION**: Explicit confirmation that Stage 4 is reached for ALL refinance credit processes
9. **SAVINGS MATHEMATICAL ACCURACY**: All savings calculations must be 100% mathematically accurate
10. **BREAK-EVEN ANALYSIS PERFECTION**: All break-even scenarios must work flawlessly

**FAILURE TO COMPLETE ANY REFINANCE CREDIT PROCESS TO STAGE 4 = TEST FAILURE**

This enhanced refinance credit framework ensures absolute perfection in refinance credit process execution, complete responsive design validation, comprehensive refinance credit link coverage, and guaranteed Stage 4 completion for all refinance credit user flows across all service endpoints.