# 🏦 **UNIFIED BANKING SYSTEM RULES - ALL 4 PROCESSES**

**SINGLE UNIFIED SYSTEM**: Complete architectural standards for all banking processes

---

## 🎯 **PRIMARY DIRECTIVE**

**ALL 4 BANKING PROCESSES MUST FOLLOW IDENTICAL PATTERNS**:
- Calculate Mortgage 
- Calculate Credit
- Refinance Mortgage  
- Refinance Credit

**ZERO EXCEPTIONS**: Every rule, pattern, and convention applies uniformly across all processes.

---

## 📋 **PROCESS STANDARDIZATION**

### Universal Process Identifiers
```yaml
PROCESS_TYPES:
  mortgage: "Calculate Mortgage"
  credit: "Calculate Credit" 
  refinance: "Refinance Mortgage"
  credit_refi: "Refinance Credit"

SCREEN_LOCATION_PATTERN: "{process_type}_step{number}"
  mortgage_step1, mortgage_step2, mortgage_step3
  credit_step1, credit_step2, credit_step3  
  refinance_step1, refinance_step2, refinance_step3
  credit_refi_step1, credit_refi_step2, credit_refi_step3

SPECIAL_SCREENS: "{process_type}_{screen_name}"
  mortgage_personal_data, credit_documents, refinance_verification, credit_refi_login
```

### Universal Step Structure (ALL PROCESSES)
```yaml
Step 1 - Application Form:
  - Process-specific input fields
  - Property/loan details
  - Basic application parameters

Step 2 - Personal Information:
  - Borrower personal data
  - Family status, education
  - Demographic information

Step 3 - Financial Information:
  - Income and employment
  - Existing debts and obligations
  - Financial capacity assessment

Step 4 - Results & Offers:
  - Bank program offers  
  - Comparison and selection
  - Application completion
```

---

## 🗃️ **DATABASE ARCHITECTURE - UNIFIED PATTERNS**

### Content Management (ALL PROCESSES)
```sql
-- UNIVERSAL CONTENT_ITEMS PATTERN
CREATE TABLE content_items (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR(255) UNIQUE NOT NULL,  -- calculate_{process}_{field}
  screen_location VARCHAR(100) NOT NULL,     -- {process}_step{n}
  component_type VARCHAR(50) NOT NULL,       -- text, label, placeholder, button
  process_type VARCHAR(20) NOT NULL,         -- mortgage, credit, refinance, credit_refi
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UNIVERSAL CONTENT_TRANSLATIONS PATTERN  
CREATE TABLE content_translations (
  id SERIAL PRIMARY KEY,
  content_item_id INTEGER REFERENCES content_items(id),
  language_code VARCHAR(5) NOT NULL,         -- en, he, ru
  content_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UNIVERSAL DROPDOWN CONFIGURATIONS
CREATE TABLE dropdown_configs (
  id SERIAL PRIMARY KEY,
  field_name VARCHAR(100) NOT NULL,
  screen_location VARCHAR(100) NOT NULL,
  process_type VARCHAR(20) NOT NULL,
  config JSONB NOT NULL,  -- {label, placeholder, options[], validation}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Universal Field Naming Convention
```yaml
FIELD_NAME_PATTERN: "calculate_{process_type}_{field_name}"

EXAMPLES:
  # Mortgage Process
  calculate_mortgage_property_ownership
  calculate_mortgage_loan_amount  
  calculate_mortgage_property_value
  
  # Credit Process  
  calculate_credit_loan_amount
  calculate_credit_loan_purpose
  calculate_credit_income_type
  
  # Refinance Mortgage Process
  calculate_refinance_current_rate
  calculate_refinance_current_lender
  calculate_refinance_property_value
  
  # Refinance Credit Process
  calculate_credit_refi_refinance_purpose
  calculate_credit_refi_current_rate
  calculate_credit_refi_debt_consolidation

PLACEHOLDER_PATTERN: "{field_name}_ph"
OPTION_PATTERN: "{field_name}_option_{number}"
VALIDATION_PATTERN: "validation_{field_name}_{rule}"
```

---

## 🔗 **API ARCHITECTURE - UNIFIED ENDPOINTS**

### Universal API Structure
```yaml
BASE_URL: "http://localhost:8003/api/v1"

CONTENT_ENDPOINTS:
  GET /content/{screen_location}/{language_code}
  Examples:
    /content/mortgage_step1/en
    /content/credit_step2/he  
    /content/refinance_step3/ru
    /content/credit_refi_step1/en

DROPDOWN_ENDPOINTS:
  GET /dropdowns/{screen_location}/{field_name}
  Examples:
    /dropdowns/mortgage_step1/property_ownership
    /dropdowns/credit_step1/loan_purpose
    /dropdowns/refinance_step1/current_lender
    /dropdowns/credit_refi_step1/refinance_purpose

CALCULATION_ENDPOINTS:
  GET /calculation-parameters?business_path={process_type}
  Examples:
    /calculation-parameters?business_path=mortgage
    /calculation-parameters?business_path=credit
    /calculation-parameters?business_path=refinance  
    /calculation-parameters?business_path=credit_refi

UNIVERSAL_RESPONSE_FORMAT:
  {
    "success": boolean,
    "data": object,
    "source": "database|json|cache", 
    "timestamp": "ISO_8601",
    "process_type": "mortgage|credit|refinance|credit_refi"
  }
```

### Universal Caching Strategy
```yaml
CACHE_LAYERS:
  Level 1 - Memory Cache (NodeCache): 5 minutes TTL
  Level 2 - Database Connection Pool: Persistent connections
  Level 3 - JSON Fallback: Static file backup

CACHE_KEYS_PATTERN:
  content: "content:{screen_location}:{language}"
  dropdown: "dropdown:{screen_location}:{field_name}"
  calculation: "calc:{process_type}:{params_hash}"

PERFORMANCE_TARGETS:
  Database Query: <50ms
  Cached Response: <1ms  
  API Response: <100ms
  Page Load: <2s
```

---

## ⚛️ **REACT ARCHITECTURE - UNIVERSAL COMPONENTS**

### Universal Component Pattern
```typescript
// UNIVERSAL BANKING FORM COMPONENT (ALL 4 PROCESSES)
interface UniversalBankingFormProps {
  processType: 'mortgage' | 'credit' | 'refinance' | 'credit_refi';
  stepNumber: number;
  screenLocation: string;
  formData: Record<string, any>;
  onFieldUpdate: (field: string, value: any) => void;
  onStepComplete: () => void;
}

const UniversalBankingForm: React.FC<UniversalBankingFormProps> = ({
  processType,
  stepNumber, 
  screenLocation,
  formData,
  onFieldUpdate,
  onStepComplete
}) => {
  const { getContent } = useContentApi(screenLocation);
  const { t } = useTranslation();

  // Universal field configurations for all processes
  const fieldConfigs = useUniversalFieldConfigs(processType, stepNumber);
  
  return (
    <FormContainer processType={processType}>
      <FormHeader>
        <h1>{getContent(`${screenLocation}_title`, `${processType} Application Step ${stepNumber}`)}</h1>
        <ProgressIndicator current={stepNumber} total={4} process={processType} />
      </FormHeader>
      
      <FormBody>
        {fieldConfigs.map((config) => (
          <UniversalFormField
            key={config.fieldName}
            config={config}
            screenLocation={screenLocation}
            value={formData[config.fieldName]}
            onChange={(value) => onFieldUpdate(config.fieldName, value)}
          />
        ))}
      </FormBody>
      
      <FormFooter>
        <NavigationButtons
          onPrevious={() => {/* Universal navigation */}}
          onNext={onStepComplete}
          processType={processType}
          stepNumber={stepNumber}
        />
      </FormFooter>
    </FormContainer>
  );
};

// UNIVERSAL FORM FIELD COMPONENT
const UniversalFormField: React.FC<{
  config: FieldConfig;
  screenLocation: string;
  value: any;
  onChange: (value: any) => void;
}> = ({ config, screenLocation, value, onChange }) => {
  const { getContent } = useContentApi(screenLocation);
  const dropdownData = useDropdownData(screenLocation, config.fieldName, 'full');
  
  // Universal error handling
  const { error, loading } = dropdownData;
  if (error) {
    console.warn(`Dropdown error for ${screenLocation}.${config.fieldName}:`, error);
  }

  switch (config.componentType) {
    case 'dropdown':
      return (
        <DropdownMenu
          title={dropdownData.label || getContent(`${screenLocation}_${config.fieldName}`, config.fallbackLabel)}
          placeholder={dropdownData.placeholder || getContent(`${screenLocation}_${config.fieldName}_ph`, config.fallbackPlaceholder)}
          data={dropdownData.options || []}
          value={value}
          onSelect={onChange}
          loading={loading}
          error={error}
          required={config.required}
        />
      );
      
    case 'input':
      return (
        <FormattedInput
          label={getContent(`${screenLocation}_${config.fieldName}`, config.fallbackLabel)}
          placeholder={getContent(`${screenLocation}_${config.fieldName}_ph`, config.fallbackPlaceholder)}
          value={value}
          onChange={onChange}
          type={config.inputType}
          validation={config.validation}
          required={config.required}
        />
      );
      
    case 'slider':
      return (
        <SliderInput
          label={getContent(`${screenLocation}_${config.fieldName}`, config.fallbackLabel)}
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          onChange={onChange}
          formatValue={config.formatValue}
        />
      );
      
    default:
      return null;
  }
};
```

### Universal Hook Patterns
```typescript
// UNIVERSAL CONTENT API HOOK (ALL PROCESSES)
const useContentApi = (screenLocation: string) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'database' | 'json' | 'cache'>('cache');

  const getContent = useCallback((key: string, fallback: string = '') => {
    // Universal fallback chain: Database → JSON → Hardcoded
    return content[key] || getJSONTranslation(key, screenLocation) || fallback;
  }, [content, screenLocation]);

  useEffect(() => {
    fetchContent(screenLocation)
      .then((data) => {
        setContent(data.content);
        setSource(data.source);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        // Fallback to JSON translations
        setContent(getJSONTranslations(screenLocation));
        setSource('json');
      });
  }, [screenLocation]);

  return { getContent, loading, error, source };
};

// UNIVERSAL DROPDOWN DATA HOOK (ALL PROCESSES)  
const useDropdownData = (
  screenLocation: string, 
  fieldName: string, 
  format: 'simple' | 'full' = 'simple'
) => {
  const [dropdownData, setDropdownData] = useState<{
    options: Array<{value: string; label: string}>;
    label?: string;
    placeholder?: string;
    loading: boolean;
    error?: string;
  }>({
    options: [],
    loading: true
  });

  useEffect(() => {
    fetchDropdownData(screenLocation, fieldName, format)
      .then((data) => {
        setDropdownData({
          options: data.options,
          label: data.label,
          placeholder: data.placeholder,
          loading: false
        });
      })
      .catch((error) => {
        console.error(`Dropdown fetch failed for ${screenLocation}.${fieldName}:`, error);
        setDropdownData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      });
  }, [screenLocation, fieldName, format]);

  return dropdownData;
};
```

---

## 🌐 **TRANSLATION STANDARDS - UNIFIED MULTI-LANGUAGE**

### Universal Translation Quality
```yaml
ENGLISH:
  Style: Professional banking and financial services
  Tone: Formal but accessible  
  Terminology: Industry-standard financial terms
  Examples:
    - "Mortgage Application" (not "Home Loan Request")
    - "Credit Assessment" (not "Loan Evaluation") 
    - "Refinancing Options" (not "Loan Replacement")

HEBREW:
  Script: Right-to-Left (RTL) support required
  Style: Formal Hebrew banking terminology
  Grammar: Proper Hebrew financial language rules
  Examples:
    - "בקשה למשכנתא" (Mortgage Application)
    - "הערכת אשראי" (Credit Assessment)
    - "אפשרויות מחזור" (Refinancing Options)

RUSSIAN:
  Style: Formal financial Russian appropriate for banking
  Terminology: Professional financial sector vocabulary  
  Grammar: Proper Russian business language
  Examples:
    - "Заявка на ипотеку" (Mortgage Application)
    - "Оценка кредитоспособности" (Credit Assessment)
    - "Варианты рефинансирования" (Refinancing Options)
```

### Universal Translation Key Structure
```yaml
CONTENT_KEY_PATTERN: "{process_type}_step{n}_{element_type}_{element_name}"

EXAMPLES_ALL_PROCESSES:
  # Titles
  mortgage_step1_title, credit_step1_title, refinance_step1_title, credit_refi_step1_title
  
  # Form Labels  
  mortgage_step1_property_ownership, credit_step1_loan_purpose, refinance_step1_current_rate
  
  # Placeholders
  mortgage_step1_property_ownership_ph, credit_step1_loan_purpose_ph, refinance_step1_current_rate_ph
  
  # Options
  mortgage_step1_property_ownership_option_1, credit_step1_loan_purpose_option_1
  
  # Validation Messages
  validation_mortgage_property_value_required, validation_credit_loan_amount_min
  
  # Buttons & Navigation  
  mortgage_step1_continue, credit_step1_continue, refinance_step1_continue, credit_refi_step1_continue
```

---

## ⚡ **PERFORMANCE STANDARDS - UNIFIED REQUIREMENTS**

### Universal Performance Targets
```yaml
DATABASE_PERFORMANCE:
  Query Response: <50ms for any process
  Connection Pool: 5-20 connections maintained
  Cache Hit Ratio: >90% for content requests
  
API_PERFORMANCE:
  Content API: <100ms response time
  Dropdown API: <150ms response time  
  Calculation API: <300ms response time
  Error Response: <50ms with fallback

FRONTEND_PERFORMANCE:
  Initial Load: <2s for any process screen
  Step Navigation: <500ms between steps
  Dropdown Load: <300ms for options display
  Form Validation: <100ms response time

CACHE_PERFORMANCE:
  Memory Cache: <1ms for hit
  Database Cache: <10ms for hit  
  JSON Fallback: <5ms for file read
  Cache Invalidation: <2s propagation
```

### Universal Error Handling
```typescript
// UNIVERSAL ERROR HANDLING FOR ALL PROCESSES
class UniversalBankingError extends Error {
  constructor(
    message: string,
    public processType: string,
    public screenLocation: string,
    public fieldName?: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'UniversalBankingError';
  }
}

const universalErrorHandler = (error: any, context: {
  processType: string;
  screenLocation: string;  
  fieldName?: string;
}) => {
  // Log error with full context
  console.error(`Banking Error [${context.processType}:${context.screenLocation}]:`, {
    message: error.message,
    fieldName: context.fieldName,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });

  // Determine fallback strategy
  if (error.name === 'NetworkError') {
    return handleNetworkFallback(context);
  } else if (error.name === 'ValidationError') {  
    return handleValidationError(error, context);
  } else {
    return handleGenericError(error, context);
  }
};

const handleNetworkFallback = (context: any) => {
  // Use JSON translations as fallback
  return {
    success: false,
    data: getJSONTranslations(context.screenLocation),
    source: 'json',
    error: 'Network error - using offline data'
  };
};
```

---

## 🔧 **DEVELOPMENT STANDARDS - UNIFIED WORKFLOW**

### Universal Development Environment
```yaml
NODE_VERSION: "20.x" (as specified in package.json)
PORTS:
  API_SERVER: 8003 (server-db.js)
  FRONTEND: 5173 (Vite development)
  FILE_SERVER: 3001 (serve.js)
  
DATABASES:
  CONTENT: "shortline" (content management)
  MAIN: "maglev" (application data)  
  MANAGEMENT: "yamanote" (admin operations)

DEVELOPMENT_COMMANDS:
  Start All: npm run dev
  API Only: node server/server-db.js
  Frontend: cd mainapp && npm run dev
  File Server: node server/serve.js
```

### Universal Testing Strategy
```yaml
UNIT_TESTS:
  Content API: Test all 4 processes equally
  Dropdown Integration: Test all field types  
  Translation Loading: Test all 3 languages
  Error Handling: Test all failure scenarios

INTEGRATION_TESTS:  
  Database Connectivity: All 3 databases
  API Endpoints: All processes and languages
  Component Rendering: All 4 process types
  Multi-Language: Hebrew RTL and Russian display

E2E_TESTS:
  Complete Flows: All 4 banking processes
  Cross-Language: Switch languages mid-flow
  Error Recovery: Network failures and fallbacks  
  Performance: Load testing for all processes
```

### Universal Code Quality
```typescript
// UNIVERSAL TYPESCRIPT INTERFACES
interface ProcessConfig {
  processType: 'mortgage' | 'credit' | 'refinance' | 'credit_refi';
  totalSteps: number;
  screenLocations: string[];
  requiredFields: string[];
  validationRules: ValidationRule[];
}

interface ContentItem {
  id: number;
  contentKey: string;
  screenLocation: string;
  componentType: 'text' | 'label' | 'placeholder' | 'button' | 'validation';
  processType: string;
  translations: {
    en: string;
    he: string;  
    ru: string;
  };
}

interface DropdownConfig {
  fieldName: string;
  screenLocation: string;
  processType: string;
  options: Array<{
    value: string;
    label: {
      en: string;
      he: string;
      ru: string;
    };
  }>;
  validation?: ValidationRule[];
}
```

---

## ✅ **VALIDATION & COMPLIANCE**

### Universal Compliance Checklist
```yaml
ARCHITECTURAL_COMPLIANCE:
  ✅ All 4 processes follow identical patterns
  ✅ Database schema consistent across processes  
  ✅ API endpoints use universal structure
  ✅ Component architecture supports all processes
  ✅ Translation keys follow unified naming
  ✅ Error handling works for all scenarios

PERFORMANCE_COMPLIANCE:
  ✅ Database queries <50ms for all processes
  ✅ API responses <100ms for all endpoints  
  ✅ Cache hit ratio >90% across all content
  ✅ Frontend loading <2s for all screens
  ✅ Fallback responses <5ms when needed

QUALITY_COMPLIANCE:
  ✅ Professional translations in all 3 languages
  ✅ Hebrew RTL displays correctly everywhere
  ✅ Russian characters render properly  
  ✅ Banking terminology consistent across processes
  ✅ Cultural sensitivity maintained throughout

TECHNICAL_COMPLIANCE:
  ✅ TypeScript interfaces cover all processes
  ✅ Error boundaries handle all failure cases
  ✅ Logging captures all process contexts  
  ✅ Validation rules consistent across forms
  ✅ Security standards applied uniformly
```

### Universal Validation Script
```bash
#!/bin/bash
# UNIVERSAL VALIDATION FOR ALL 4 BANKING PROCESSES

echo "🏦 VALIDATING UNIFIED BANKING SYSTEM - ALL 4 PROCESSES"

PROCESSES=("mortgage" "credit" "refinance" "credit_refi")
STEPS=("step1" "step2" "step3" "personal_data" "documents")  
LANGUAGES=("en" "he" "ru")

# Validate Content API for all processes
echo "📄 Testing Content API..."
for process in "${PROCESSES[@]}"; do
  for step in "${STEPS[@]}"; do
    for lang in "${LANGUAGES[@]}"; do
      SCREEN_LOCATION="${process}_${step}"
      RESPONSE=$(curl -s "http://localhost:8003/api/v1/content/${SCREEN_LOCATION}/${lang}")
      
      if [[ $RESPONSE == *"error"* ]] || [[ -z "$RESPONSE" ]]; then
        echo "❌ FAILED: Content API ${SCREEN_LOCATION} - ${lang}"
        exit 1
      else
        echo "✅ SUCCESS: Content API ${SCREEN_LOCATION} - ${lang}"
      fi
    done
  done
done

# Validate Dropdown API for all processes
echo "🔽 Testing Dropdown API..."  
DROPDOWN_FIELDS=("property_ownership" "loan_purpose" "current_rate" "refinance_purpose")
for process in "${PROCESSES[@]}"; do
  for field in "${DROPDOWN_FIELDS[@]}"; do
    RESPONSE=$(curl -s "http://localhost:8003/api/v1/dropdowns/${process}_step1/${field}")
    
    if [[ $RESPONSE == *"options"* ]]; then
      echo "✅ SUCCESS: Dropdown API ${process}_step1/${field}"
    else  
      echo "❌ FAILED: Dropdown API ${process}_step1/${field}"
      exit 1
    fi
  done
done

# Validate Database Performance
echo "⚡ Testing Performance..."
for process in "${PROCESSES[@]}"; do
  START_TIME=$(date +%s%3N)
  curl -s "http://localhost:8003/api/v1/content/${process}_step1/en" > /dev/null
  END_TIME=$(date +%s%3N)
  DURATION=$((END_TIME - START_TIME))
  
  if [[ $DURATION -lt 100 ]]; then
    echo "✅ SUCCESS: Performance ${process} - ${DURATION}ms"
  else
    echo "❌ FAILED: Performance ${process} - ${DURATION}ms (>100ms)"
    exit 1
  fi
done

echo "🎉 ALL VALIDATION PASSED - UNIFIED BANKING SYSTEM READY"
```

---

## 🎯 **SUCCESS CRITERIA**

### Universal System Compliance
- ✅ **Architectural Unity**: All 4 processes use identical patterns and conventions
- ✅ **Performance Uniformity**: Same performance targets and metrics across processes  
- ✅ **Quality Consistency**: Professional banking experience in all 3 languages
- ✅ **Error Handling**: Universal fallback and recovery systems
- ✅ **Developer Experience**: Single codebase patterns for all banking functionality
- ✅ **User Experience**: Consistent interface and behavior across all processes
- ✅ **Maintenance**: Single source of truth for all architectural decisions
- ✅ **Scalability**: Easy addition of new processes using existing patterns

**THE BANKING SYSTEM ACTS AS A SINGLE UNIFIED UNIT WITH IDENTICAL RULES, PATTERNS, AND STANDARDS ACROSS ALL 4 PROCESSES - NO EXCEPTIONS.**