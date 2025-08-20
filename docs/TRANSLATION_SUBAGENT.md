# 🤖 **TRANSLATION SUBAGENT INSTRUCTIONS**
**Specialized AI Agent for Credit Refinancing Translation Implementation**

## 🎯 **AGENT MISSION**

You are a **specialized translation implementation agent** responsible for migrating **344 hardcoded credit refinancing translations** to the bulletproof database-first translation system using exact patterns from working mortgage implementations.

---

## 📚 **REQUIRED KNOWLEDGE BASE**

### **\u26a0\ufe0f CRITICAL: Read These Documents First**

1. **`@docs/systemTranslationLogic.md`** - Complete translation system architecture
2. **`@docs/CREDIT_REFI_TRANSLATION_IMPLEMENTATION_PLAN.md`** - Detailed implementation plan with SQL scripts
3. **`@CREDIT_REFI_MISSING_TRANSLATIONS_MAP.md`** - Complete mapping of 344 missing items
4. **`@server/docs/Architecture/dropDownLogicBankim.md`** - Dropdown system integration

### **Proven Implementation Patterns (FROM WORKING MORTGAGE SYSTEM)**

```typescript
// \u2705 PROVEN PATTERN: Successfully used in mortgage calculator
const Component = ({ screenLocation = 'credit_refi_step1' }) => {
  const { getContent } = useContentApi(screenLocation);  // Database-first content
  const dropdownData = useDropdownData(screenLocation, 'field_name', 'full');  // Database dropdowns
  
  return (
    <DropdownMenu
      title={dropdownData.label || getContent(`${screenLocation}.field.field_name`, 'fallback_key')}
      placeholder={dropdownData.placeholder || getContent(`${screenLocation}.field.field_name_ph`, 'fallback_placeholder')}
      data={dropdownData.options}
      disabled={dropdownData.loading}
    />
  );
};
```

### **Database Architecture (MANDATORY)**
```yaml
CONTENT Database (shortline): 
  - content_items: Master content key definitions
  - content_translations: Language-specific translations (en/he/ru)
  - Connection: contentPool (NOT pool or corePool)
  
MAIN Database (maglev):
  - dropdown_configs: JSONB dropdown configurations
  - Connection: pool (main database)
```

---

## \ud83c\udfa8 **AGENT CAPABILITIES & RESPONSIBILITIES**

### **Phase 1: Database Migration (Days 1-2)**

#### **Task 1A: Create Content Items**
```sql
-- \u26a0\ufe0f CRITICAL: Use EXACT SQL from implementation plan
-- Execute for ALL 20 screens (344 total items)

INSERT INTO content_items (content_key, screen_location, component_type, category, element_order) VALUES
('credit_refi_step1_title', 'credit_refi_step1', 'text', 'form_header', 1),
('credit_refi_step1_current_loan_amount', 'credit_refi_step1', 'label', 'form_field', 10),
-- ... continue for all items per implementation plan
```

**Validation Requirements:**
- \u2705 Verify all 344 content_items created
- \u2705 Check proper screen_location values
- \u2705 Validate content_key naming convention
- \u2705 Test database query performance

#### **Task 1B: Create Translations**
```sql
-- \u26a0\ufe0f CRITICAL: Professional financial terminology for all 3 languages
-- Total: 1,032 translation records (344 items × 3 languages)

INSERT INTO content_translations (content_item_id, language_code, content_value, status) VALUES
((SELECT id FROM content_items WHERE content_key = 'credit_refi_step1_title'), 'en', 'Credit Refinancing Application', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'credit_refi_step1_title'), 'he', '\u05d1\u05e7\u05e9\u05d4 \u05dc\u05de\u05d7\u05d6\u05d5\u05e8 \u05d0\u05e9\u05e8\u05d0\u05d9', 'approved'),
((SELECT id FROM content_items WHERE content_key = 'credit_refi_step1_title'), 'ru', '\u0417\u0430\u044f\u0432\u043a\u0430 \u043d\u0430 \u0440\u0435\u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043a\u0440\u0435\u0434\u0438\u0442\u0430', 'approved'),
-- ... continue for all translations
```

**Quality Requirements:**
- \u2705 **English**: Professional banking terminology
- \u2705 **Hebrew**: Proper RTL financial terms with correct gender/grammar
- \u2705 **Russian**: Formal financial language appropriate for banking
- \u2705 **Validation**: All translations culturally appropriate and accurate

#### **Task 1C: Create Dropdown Configurations**
```sql
-- \u26a0\ufe0f CRITICAL: Use JSONB format in dropdown_configs table
-- Follow EXACT pattern from implementation plan

INSERT INTO dropdown_configs (business_path, screen_id, field_name, dropdown_key, dropdown_data, is_active) VALUES (
  'credit_refinance',
  'credit_refi_step1', 
  'refinance_purpose',
  'credit_refi_step1_refinance_purpose',
  '{\"label\": {\"en\": \"Refinancing Purpose\", \"he\": \"\u05de\u05d8\u05e8\u05ea \u05d4\u05de\u05d7\u05d6\u05d5\u05e8\", \"ru\": \"\u0426\u0435\u043b\u044c \u0440\u0435\u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f\"}, \"options\": [...]}',\n  true\n);\n```\n\n### **Phase 2: Component Implementation (Days 3-5)**\n\n#### **Task 2A: Create React Components**\n```typescript\n// \u26a0\ufe0f CRITICAL: Use EXACT pattern from working mortgage components\n// File: mainapp/src/pages/Services/pages/CreditRefinance/pages/Step1/CreditRefiStep1Form.tsx\n\nimport React from 'react';\nimport { useFormikContext } from 'formik';\nimport { useTranslation } from 'react-i18next';\nimport { useContentApi } from '@src/hooks/useContentApi';  // Database-first\nimport { useDropdownData } from '@src/hooks/useDropdownData';  // Database dropdowns\n\nconst CreditRefiStep1Form = ({ screenLocation = 'credit_refi_step1' }) => {\n  const { t } = useTranslation(); // JSON fallback system\n  const { getContent, loading, error } = useContentApi(screenLocation); // Database-first system\n  const { values, setFieldValue } = useFormikContext<any>();\n  \n  // Dropdown integration following exact mortgage patterns\n  const refinancePurposeData = useDropdownData(screenLocation, 'refinance_purpose', 'full');\n  \n  return (\n    <div className=\"credit-refi-step1\">\n      {/* Database-first with JSON fallback */}\n      <h1>{getContent('credit_refi_step1_title', 'Credit Refinancing Application')}</h1>\n      \n      <DropdownMenu\n        title={refinancePurposeData.label || getContent('credit_refi_step1_refinance_purpose', 'Refinancing Purpose')}\n        placeholder={refinancePurposeData.placeholder || getContent('credit_refi_step1_refinance_purpose_ph', 'Select refinancing purpose')}\n        data={refinancePurposeData.options}\n        value={values.refinance_purpose}\n        onChange={(value) => setFieldValue('refinance_purpose', value)}\n        disabled={refinancePurposeData.loading}\n        error={refinancePurposeData.error}\n      />\n    </div>\n  );\n};\n```\n\n**Implementation Requirements:**\n- \u2705 **Screen Locations**: All 20 screens (credit_refi_step1, credit_refi_step2, etc.)\n- \u2705 **Hook Integration**: useContentApi + useDropdownData on ALL components\n- \u2705 **Fallback System**: JSON fallback for every getContent() call\n- \u2705 **Field Naming**: Follow exact convention from working mortgage system\n- \u2705 **Error Handling**: Graceful error display and fallback activation\n\n#### **Task 2B: Update Routing and Navigation**\n```typescript\n// File: mainapp/src/app/AppRoutes/ServiceRoutes.tsx\n// Add credit refinancing routes following mortgage pattern\n\nconst ServiceRoutes = () => {\n  return (\n    <Routes>\n      {/* Existing mortgage routes */}\n      <Route path=\"/services/calculate-mortgage/:step\" element={<MortgageCalculator />} />\n      \n      {/* \u26a0\ufe0f NEW: Credit refinancing routes */}\n      <Route path=\"/services/refinance-credit/:step\" element={<CreditRefinanceCalculator />} />\n      <Route path=\"/services/refinance-credit/personal-data\" element={<CreditRefiPersonalData />} />\n      <Route path=\"/services/refinance-credit/partner-income\" element={<CreditRefiPartnerIncome />} />\n      {/* ... continue for all 20 screens */}\n    </Routes>\n  );\n};\n```\n\n### **Phase 3: Testing & Validation (Day 6-7)**\n\n#### **Task 3A: Execute Validation Scripts**\n```bash\n#!/bin/bash\n# \u26a0\ufe0f CRITICAL: Run comprehensive validation\n\necho \"\ud83e\uddea Testing Credit Refinancing Translation System...\"\n\nSCREENS=(\"credit_refi_step1\" \"credit_refi_step2\" \"credit_refi_personal_data\")\nLANGUAGES=(\"en\" \"he\" \"ru\")\nFAILED=0\n\n# Test content API for all screens/languages\nfor screen in \"${SCREENS[@]}\"; do\n    for lang in \"${LANGUAGES[@]}\"; do\n        RESPONSE=$(curl -s \"http://localhost:8003/api/content/${screen}/${lang}\")\n        DB_SOURCE=$(echo \"$RESPONSE\" | jq -r '.metadata.source // \"unknown\"')\n        if [[ \"$DB_SOURCE\" != \"database\" ]]; then\n            echo \"\u274c CRITICAL: Not using database source for ${screen}/${lang}\"\n            FAILED=1\n        fi\n    done\ndone\n\n# Test dropdown integration\necho \"\ud83d\udd0d Testing critical credit_refi_step1 dropdowns...\"\nFIELD_OPTIONS=$(curl -s \"http://localhost:8003/api/dropdowns/credit_refi_step1/he\" | jq -r \".refinance_purpose.options | length // 0\")\nif [[ \"$FIELD_OPTIONS\" -gt 0 ]]; then\n    echo \"\u2705 PASS: refinance_purpose - ${FIELD_OPTIONS} options\"\nelse\n    echo \"\u274c CRITICAL: refinance_purpose - No options found\"\n    FAILED=1\nfi\n\nif [[ $FAILED -eq 1 ]]; then\n    echo \"\ud83d\udea8 VALIDATION FAILED - DO NOT PROCEED\"\n    exit 1\nelse\n    echo \"\u2705 SUCCESS: Credit Refinancing Translation System validated\"\nfi\n```\n\n**Validation Checklist:**\n- \u2705 All 344 translations accessible via content API\n- \u2705 All 20 screens load without errors\n- \u2705 Hebrew text displays properly (RTL)\n- \u2705 Russian text displays correctly\n- \u2705 Dropdown integration functional\n- \u2705 Fallback system activates on errors\n- \u2705 Performance meets targets (<50ms API, <1ms cached)\n\n---\n\n## \ud83d\udd10 **FIELD NAME MAPPING RULES**\n\n### **\u26a0\ufe0f CRITICAL: Exact Conventions from Working System**\n\n```yaml\n# Based on successful mortgage implementation patterns\n\nField Name Mapping Formula:\n  Component Field Name \u2192 Database Content Key \u2192 API Generated Key\n  \nExamples:\n  'current_loan_amount' \u2192 'credit_refi_step1_current_loan_amount' \u2192 'credit_refi_step1_current_loan_amount'\n  'refinance_purpose' \u2192 'credit_refi_step1_refinance_purpose' \u2192 'credit_refi_step1_refinance_purpose'\n  'property_type' \u2192 'credit_refi_step2_property_type' \u2192 'credit_refi_step2_property_type'\n\nKey Generation Algorithm:\n  content_key = `${screen_location}_${field_name}[_${key_type}]`\n  \nScreen Locations:\n  - credit_refi_step1 (23 items)\n  - credit_refi_step2 (34 items)\n  - credit_refi_personal_data (25 items)\n  - credit_refi_partner_income (26 items)\n  - credit_refi_login (12 items)\n  - credit_refi_password_reset (10 items)\n  - [14 additional screens with 214 items]\n```\n\n---\n\n## \ud83d\ude91 **ERROR HANDLING & EMERGENCY PROCEDURES**\n\n### **Common Issues & Solutions**\n\n#### **Issue: \"contentPool is not defined\"**\n```bash\n# Cause: Missing content database configuration\n# Solution:\necho \"CONTENT_DATABASE_URL=postgresql://postgres:SuFkUevgonaZFXJiJeczFiXYTlICHVJL@shortline.proxy.rlwy.net:33452/railway\" >> .env\nnpm restart\n```\n\n#### **Issue: \"Translation key not found\"**\n```bash\n# Debug steps:\n# 1. Check if key exists in database\nnode -e \"\nimport { contentPool } from './config/database.js';\ncontentPool.query('SELECT content_key, content_value FROM content_items JOIN content_translations ON content_items.id = content_translations.content_item_id WHERE content_key LIKE \\\\'%YOUR_KEY%\\\\' LIMIT 5').then(r => console.log(r.rows));\n\"\n\n# 2. Test content API endpoint\ncurl \"http://localhost:8003/api/content/credit_refi_step1/en\" | jq '.content | keys'\n```\n\n#### **Issue: \"Empty dropdown options\"**\n```bash\n# Cause: Wrong database pool being used\n# Solution: Ensure dropdown API uses correct pool\n# In server-db.js, dropdowns should use `pool` (main DB)\n# Content should use `contentPool` (content DB)\n\n# Test dropdown API:\ncurl \"http://localhost:8003/api/dropdowns/credit_refi_step1/he\" | jq '.refinance_purpose.options'\n```\n\n---\n\n## \ud83d\udcca **SUCCESS CRITERIA & METRICS**\n\n### **Deployment Approval Checklist**\n\n```markdown\nDatabase Validation:\n- [ ] All 344 content_items created successfully\n- [ ] All 1,032 translations inserted (en/he/ru)\n- [ ] All dropdown configurations functional\n- [ ] Content API responds <50ms (uncached)\n- [ ] Cache system working (<1ms cached responses)\n\nComponent Validation:\n- [ ] All 20 credit refinancing components created\n- [ ] useContentApi integration working on all components\n- [ ] useDropdownData integration working on all dropdowns\n- [ ] Fallback system tested (components work with empty database)\n- [ ] Hebrew RTL display confirmed\n- [ ] Russian text display confirmed\n\nSystem Integration:\n- [ ] Navigation and routing updated\n- [ ] No hardcoded text remaining in components\n- [ ] Performance benchmarks met\n- [ ] Error handling graceful\n- [ ] Development debugging functional\n\nQuality Assurance:\n- [ ] Professional banking terminology used\n- [ ] Cultural appropriateness validated\n- [ ] Cross-browser compatibility tested\n- [ ] Mobile responsive confirmed\n- [ ] Accessibility compliance (WCAG)\n```\n\n### **Performance Targets**\n```yaml\nResponse Times:\n  - Content API (database): <50ms\n  - Content API (cached): <1ms  \n  - Dropdown API: <100ms\n  - Page load time: <3 seconds\n  - Language switch: <500ms\n\nReliability:\n  - Database connection uptime: >99.9%\n  - Translation fallback success: 100%\n  - Error recovery rate: 100%\n  - Cache hit rate: >80%\n```\n\n---\n\n## \ud83d\udcdd **REPORTING REQUIREMENTS**\n\n### **Progress Reports**\n\nAfter each major milestone, provide:\n\n```markdown\n# Credit Refinancing Translation Implementation Report\n\n## Completed Tasks\n- [x] Database migration: 344 content items + 1,032 translations\n- [x] Component implementation: 20 React components\n- [x] Dropdown integration: All form fields functional\n- [x] Validation testing: All tests passing\n\n## Key Metrics\n- Translation coverage: 344/344 (100%)\n- Language support: 3/3 languages (en/he/ru)\n- Component completion: 20/20 screens\n- Performance: <50ms API response time\n- Error rate: 0% (all fallbacks working)\n\n## Issues Encountered\n- [List any issues and how they were resolved]\n\n## Next Steps\n- [Any remaining tasks or recommendations]\n\n## Deployment Status\n- [ ] Ready for production deployment\n- [ ] Requires additional testing\n- [ ] Issues need resolution\n```\n\n---\n\n## \ud83c\udfaf **AGENT SUCCESS DEFINITION**\n\n**Mission Accomplished When:**\n\n\u2705 **All 344 credit refinancing translations** are migrated to database system  \n\u2705 **All 20 credit refinancing components** are implemented with database integration  \n\u2705 **All dropdown systems** are functional with proper multilingual support  \n\u2705 **All validation tests pass** with 0 failures  \n\u2705 **Professional banking terminology** is used throughout  \n\u2705 **Hebrew RTL and Russian** text display correctly  \n\u2705 **Performance targets are met** (<50ms API, <1ms cached)  \n\u2705 **Fallback system works** (graceful degradation to JSON)  \n\u2705 **System is production-ready** with comprehensive testing completed  \n\n**Result**: Credit refinancing system with same reliability, performance, and user experience as the working mortgage calculator, supporting all required languages and providing professional banking-grade translations.\n\n---\n\n## \ud83d\ude80 **IMMEDIATE ACTION ITEMS**\n\n1. **Read all reference documents** to understand the complete system\n2. **Execute Phase 1**: Database migration with SQL scripts\n3. **Execute Phase 2**: Component implementation following exact patterns\n4. **Execute Phase 3**: Comprehensive validation and testing\n5. **Report progress** at each milestone\n6. **Request deployment approval** only after all validation passes\n\n**This agent has everything needed to successfully implement the credit refinancing translation system using bulletproof, production-tested patterns.**