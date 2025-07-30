# 📋 Dropdown Migration Questions & Answers

## 🎯 **Question 1: Option Naming Pattern**

### **Which naming convention should be used - descriptive values (_hapoalim) or numeric ordering (_option_1)?**

**Answer: Use descriptive values (`_hapoalim`) for the refinance mortgage migration.**

**Reasoning:**
- **Document convention** (`mortgage_refinance_bank_hapoalim`) is more semantic and meaningful
- **Codebase convention** (`field_name_option_1`) is generic and less readable
- **For refinance mortgage**, descriptive names make more sense because:
  - Bank names are meaningful (`hapoalim`, `leumi`, `discount`)
  - Property types are descriptive (`apartment`, `house`, `commercial`)
  - Refinance purposes are specific (`lower_rate`, `reduce_payment`)

**Recommendation:** Use descriptive values for this migration, but be consistent within each dropdown group.

**Example:**
```sql
-- ✅ Correct: Descriptive values
mortgage_refinance_bank_hapoalim
mortgage_refinance_bank_leumi
mortgage_refinance_bank_discount
mortgage_refinance_bank_massad

-- ❌ Avoid: Generic numeric values
mortgage_refinance_bank_option_1
mortgage_refinance_bank_option_2
mortgage_refinance_bank_option_3
mortgage_refinance_bank_option_4
```

---

## 🎯 **Question 2: Screen Location vs Component Type**

### **Are there cases where the same content_key might appear in multiple screen_locations, or is this always a 1:1 relationship?**

**Answer: Generally NO, but there are exceptions.**

**Analysis:**
- **Primary rule:** Each `content_key` should be unique within a `screen_location`
- **Exception cases:**
  - **Shared components** (like common buttons: "Next", "Back")
  - **Reusable labels** (like "Name", "Email" across different forms)
  - **Global navigation** items that appear on multiple screens

**For refinance mortgage:** Each dropdown should have unique `content_key` values within `refinance_mortgage_2` screen.

**Example:**
```sql
-- ✅ Correct: Unique keys per screen
refinance_mortgage_2: mortgage_refinance_bank_hapoalim
refinance_mortgage_3: mortgage_refinance_income_type_salary

-- ❌ Avoid: Same key across screens (unless intentional)
refinance_mortgage_2: next_button
refinance_mortgage_3: next_button  -- This is OK for shared buttons
```

**Query Pattern:**
```sql
-- Filter by both screen_location AND component_type
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2' 
  AND ci.component_type = 'dropdown'
  AND ci.is_active = true
  AND ct.status = 'approved';
```

---

## 🎯 **Question 3: Translation Status**

### **Should all production queries filter by status = 'approved'?**

**Answer: YES, production queries should filter by status = 'approved'.**

**Reasoning:**
- **Development:** Use `draft` or no status filter for testing
- **Production:** Always filter by `status = 'approved'` for:
  - **Content safety** - Only show reviewed content
  - **Consistency** - Prevent incomplete translations from appearing
  - **Quality control** - Ensure all content is properly translated

**Status Values:**
- `"approved"` = Production ready, show to users
- `"draft"` = Under development, only show in dev mode
- `"pending"` = Under review, don't show to users

**Recommended Query Pattern:**
```sql
-- ✅ Production query
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2'
  AND ci.is_active = true
  AND ct.status = 'approved'  -- ← Always include this for production
  AND ct.language_code = 'en';

-- ✅ Development query (optional)
SELECT * FROM content_items ci
JOIN content_translations ct ON ci.id = ct.content_item_id
WHERE ci.screen_location = 'refinance_mortgage_2'
  AND ci.is_active = true
  AND ct.language_code = 'en';
```

---

## 🎯 **Summary for Refinance Mortgage Migration**

### **Best Practices:**

1. **Use descriptive option names** (`_hapoalim`, `_leumi`) instead of numeric (`_option_1`)
2. **Keep content_key unique** within `refinance_mortgage_2` screen
3. **Set status = 'approved'** for all migrated content to ensure it appears in production

### **Migration Checklist:**

- [ ] Use descriptive naming convention for dropdown options
- [ ] Ensure unique content_key values within screen_location
- [ ] Set all translations to status = 'approved'
- [ ] Test both development and production queries
- [ ] Verify all languages (en, he, ru) are properly migrated

### **Example Migration Structure:**

```sql
-- Content Items
INSERT INTO content_items (content_key, component_type, screen_location, category, is_active)
VALUES 
('mortgage_refinance_bank', 'dropdown', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_bank_hapoalim', 'option', 'refinance_mortgage_2', 'form', true),
('mortgage_refinance_bank_ph', 'placeholder', 'refinance_mortgage_2', 'form', true);

-- Translations (with approved status)
INSERT INTO content_translations (content_item_id, language_code, content_value, status)
VALUES 
(item_id, 'en', 'Bank Hapoalim', 'approved'),
(item_id, 'he', 'בנק הפועלים', 'approved'),
(item_id, 'ru', 'Банк Апоалим', 'approved');
```

This ensures the migrated dropdowns will work properly and follow the established conventions!
