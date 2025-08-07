# 🏗️ Development Principles & Guidelines

**Banking Application Development Standards**

---

## 🚨 CRITICAL RULE: systemTranslationLogic.md Compliance

### **NEVER MODIFY systemTranslationLogic.md WITHOUT EXPLICIT PERMISSION**

The `systemTranslationLogic.md` document is the **SINGLE SOURCE OF TRUTH** for:
- Database-first translation architecture
- Content management patterns
- API endpoint specifications
- Component integration standards

### **ALWAYS FOLLOW systemTranslationLogic.md**

When implementing any translation or content-related functionality:

✅ **DO:**
- Follow the documented database-first approach
- Use the specified API patterns (`/api/content/{screen}/{lang}`)
- Implement proper fallback mechanisms
- Use the documented key naming conventions
- Follow the caching specifications (5-minute TTL)

❌ **NEVER:**
- Change systemTranslationLogic.md without explicit user permission
- Deviate from the documented patterns
- Create alternative translation systems
- Modify the established architecture without approval

---

## 📋 Component Development Standards

### **Dropdown Components**

**Required Pattern:**
```typescript
// CORRECT: Follow systemTranslationLogic.md
const dropdownData = useDropdownData(screenLocation, 'field_name', 'full')

// Component should handle:
// - Database-first loading
// - Proper error states  
// - Fallback content keys
// - Loading states
```

**Field Name Mapping:**
- Use **exact field names** that match database structure
- Handle **semantic values** returned by database-first approach
- Maintain **backward compatibility** for legacy formats
- Always **map new semantic values** to component logic

### **Translation Integration**

**Database-First Priority:**
1. Primary: `useContentApi(screenLocation)` + `getContent(key, fallback)`
2. Fallback: `useTranslation()` + `t(key)` for JSON files
3. Error handling: Graceful degradation to JSON files

**Content Key Patterns:**
```typescript
// CORRECT: systemTranslationLogic.md patterns
'calculate_mortgage_main_source'           // Label
'calculate_mortgage_main_source_ph'        // Placeholder  
'calculate_mortgage_main_source_option_1'  // Options
```

---

## 🔧 Bug Fix Methodology

### **When Fixing Dropdown Issues:**

1. **Check systemTranslationLogic.md compliance FIRST**
2. **Verify database content exists** for expected keys
3. **Update component field names** to match API patterns
4. **Fix mapping logic** to handle new semantic values
5. **Never change the systemTranslationLogic.md architecture**

### **Recent Example: Main Source of Income Regression**

**Problem:** Component expected `option_1` but database returned `employee`

**WRONG Approach:** Modify systemTranslationLogic.md or database
**CORRECT Approach:** Update component mapping to handle semantic values

```typescript
// FIXED: Added semantic value mapping
const mapping = {
  // New semantic values (systemTranslationLogic.md compliant)
  'employee': 'employee',
  'selfemployed': 'selfemployed',
  // Legacy support
  'option_1': 'employee',
  'option_2': 'selfemployed'
}
```

---

## 📊 Database Content Management

### **Content Item Creation:**

**Required Fields:**
- `content_key`: Follow systemTranslationLogic.md patterns
- `screen_location`: Match component `screenLocation` parameter
- `component_type`: Specify 'label', 'placeholder', 'option', etc.

**Screen Location Mapping:**
```sql
-- CORRECT: Component screen_location matches database
useDropdownData('mortgage_step3', 'main_source', 'full')
-- Must find: screen_location = 'mortgage_step3'
```

### **Key Naming Standards:**

```typescript
// systemTranslationLogic.md Pattern
'calculate_mortgage_{field_name}'           // Base key
'calculate_mortgage_{field_name}_ph'        // Placeholder
'calculate_mortgage_{field_name}_option_N'  // Options
```

---

## 🎯 Testing & Verification

### **Before Deployment:**

1. ✅ **Verify systemTranslationLogic.md compliance**
2. ✅ **Test database-first loading**
3. ✅ **Confirm dropdown options appear**
4. ✅ **Validate conditional UI elements**
5. ✅ **Check all three languages (en, he, ru)**
6. ✅ **Test fallback mechanisms**

### **Regression Prevention:**

- **Always test conditional components** after dropdown changes
- **Verify semantic value mapping** when updating to database-first
- **Check console logs** for mapping debug information
- **Test both legacy and new value formats**

---

## 🚀 Implementation Checklist

### **New Dropdown Component:**

- [ ] Use `useDropdownData(screenLocation, fieldName, 'full')`
- [ ] Handle loading/error states
- [ ] Implement proper value mapping for conditional UI
- [ ] Add fallback content keys matching systemTranslationLogic.md
- [ ] Test with actual database content

### **Existing Dropdown Updates:**

- [ ] Verify field name matches API-generated keys
- [ ] Update mapping logic for semantic values
- [ ] Maintain backward compatibility
- [ ] Test conditional UI element rendering
- [ ] Confirm systemTranslationLogic.md compliance

---

## 🛡️ Architecture Protection

### **systemTranslationLogic.md is IMMUTABLE**

The document represents:
- **Proven architecture** with optimal performance
- **Established patterns** used across 273+ files
- **Database schema** supporting 500+ content items
- **Cache optimization** with 5-minute TTL
- **Multi-language support** for 3 languages

**Any changes require explicit user approval and careful impact analysis.**

### **When in Doubt:**

1. **Consult systemTranslationLogic.md FIRST**
2. **Follow established patterns**
3. **Ask for permission before architectural changes**
4. **Prioritize compliance over convenience**

---

*This document ensures consistent, reliable development that respects the established systemTranslationLogic.md architecture.*
