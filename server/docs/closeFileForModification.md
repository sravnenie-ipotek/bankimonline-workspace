# 🛡️ File-Level AI Protection Guide

## Overview
This guide provides standardized comment templates to protect files from AI modifications unless explicitly requested. Use these templates to mark files that should remain unchanged.

---

## 🚨 **Standard Protection Template**

### **Basic Protection (Recommended)**
```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * This file is protected from AI modifications unless explicitly requested.
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT add new features or functionality
 * - ONLY modify if user specifically asks for changes
 * 
 * Last modified: [Date]
 * Protected by: [Your Name]
 * File purpose: [Brief description]
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your existing code here...
```

### **Enhanced Protection (For Critical Files)**
```typescript
/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT add new features or functionality
 * - DO NOT modify imports or dependencies
 * - DO NOT change component props or interfaces
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file handles [specific business logic]
 * - Changes could affect [specific functionality]
 * - Requires thorough testing before any modifications
 * 
 * Last modified: [Date]
 * Protected by: [Your Name]
 * File purpose: [Brief description]
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 * To allow specific modifications, add: "ALLOW_MODIFICATIONS: [specific_type]"
 */

// Your existing code here...
```

---

## 📋 **Quick Protection Templates**

### **For React Components**
```typescript
/**
 * 🛡️ PROTECTED REACT COMPONENT 🚨
 * 
 * PROTECTION RULES:
 * - DO NOT modify component logic or structure
 * - DO NOT change props, state, or hooks
 * - DO NOT refactor or optimize
 * - ONLY modify if explicitly requested
 * 
 * Component: [ComponentName]
 * Purpose: [Brief description]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

import React from 'react'
// Your component code...
```

### **For Utility Functions**
```typescript
/**
 * 🛡️ PROTECTED UTILITY FUNCTION 🚨
 * 
 * PROTECTION RULES:
 * - DO NOT modify function logic or parameters
 * - DO NOT change return values or behavior
 * - DO NOT optimize or refactor
 * - ONLY modify if explicitly requested
 * 
 * Function: [FunctionName]
 * Purpose: [Brief description]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your utility function code...
```

### **For Configuration Files**
```typescript
/**
 * 🛡️ PROTECTED CONFIGURATION 🚨
 * 
 * PROTECTION RULES:
 * - DO NOT modify configuration values
 * - DO NOT change structure or format
 * - DO NOT add or remove settings
 * - ONLY modify if explicitly requested
 * 
 * Config type: [ConfigurationType]
 * Purpose: [Brief description]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your configuration code...
```

---

## 🎯 **Specific Use Cases**

### **For Legal/Content Pages**
```typescript
/**
 * 🛡️ LEGAL CONTENT PROTECTION 🚨
 * 
 * ⚠️  WARNING: This file contains legal content
 * 
 * PROTECTION RULES:
 * - DO NOT modify any text content
 * - DO NOT change legal terms or conditions
 * - DO NOT modify structure or formatting
 * - DO NOT add or remove sections
 * - ONLY modify if explicitly requested by legal team
 * 
 * Content type: [Legal/Privacy/Terms]
 * Last reviewed: [Date]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your legal content code...
```

### **For Database Schemas**
```typescript
/**
 * 🛡️ DATABASE SCHEMA PROTECTION 🚨
 * 
 * ⚠️  WARNING: This file contains database structure
 * 
 * PROTECTION RULES:
 * - DO NOT modify table structures
 * - DO NOT change column names or types
 * - DO NOT modify relationships or constraints
 * - DO NOT add or remove tables/columns
 * - ONLY modify if explicitly requested
 * 
 * Database: [DatabaseName]
 * Purpose: [Brief description]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your database schema code...
```

### **For API Endpoints**
```typescript
/**
 * 🛡️ API ENDPOINT PROTECTION 🚨
 * 
 * ⚠️  WARNING: This file contains API logic
 * 
 * PROTECTION RULES:
 * - DO NOT modify endpoint logic
 * - DO NOT change request/response structure
 * - DO NOT modify validation or authentication
 * - DO NOT add or remove endpoints
 * - ONLY modify if explicitly requested
 * 
 * Endpoint: [EndpointPath]
 * Method: [GET/POST/PUT/DELETE]
 * Protected by: [Your Name]
 * 
 * To allow modifications: "ALLOW_AI_MODIFICATIONS: true"
 */

// Your API endpoint code...
```

---

## 🔧 **How to Use These Templates**

### **Step 1: Choose the Right Template**
- **Basic Protection**: For most files
- **Enhanced Protection**: For critical business logic
- **Specific Templates**: For React components, utilities, configs
- **Use Case Templates**: For legal content, databases, APIs

### **Step 2: Add to File Header**
Place the protection comment at the very top of the file, before any imports:

```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * This file is protected from AI modifications unless explicitly requested.
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - ONLY modify if user specifically asks for changes
 * 
 * Last modified: 2024-01-15
 * Protected by: [Your Name]
 * File purpose: Main source of income dropdown component
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

import { useFormikContext } from 'formik'
// Rest of your code...
```

### **Step 3: Update When Modified**
When you make changes to a protected file, update the comment:

```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * This file is protected from AI modifications unless explicitly requested.
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - ONLY modify if user specifically asks for changes
 * 
 * Last modified: 2024-01-20 (Updated validation logic)
 * Protected by: [Your Name]
 * File purpose: Main source of income dropdown component
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */
```

---

## 🚀 **Allowing Modifications**

### **Temporary Allowance**
To allow AI modifications for a specific change, add this comment:

```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * ALLOW_AI_MODIFICATIONS: true
 * REASON: Fixing dropdown validation bug as requested by user
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - ONLY modify if user specifically asks for changes
 * 
 * Last modified: 2024-01-15
 * Protected by: [Your Name]
 * File purpose: Main source of income dropdown component
 */
```

### **Specific Modification Allowance**
To allow only specific types of modifications:

```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * ALLOW_MODIFICATIONS: bug_fixes, validation_improvements
 * REASON: User requested validation improvements
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - ONLY modify if user specifically asks for changes
 * 
 * Last modified: 2024-01-15
 * Protected by: [Your Name]
 * File purpose: Main source of income dropdown component
 */
```

---

## 📝 **Best Practices**

### **1. Be Specific**
- Clearly state what the file does
- Explain why it's protected
- Specify what modifications are allowed

### **2. Keep Updated**
- Update the "Last modified" date when you make changes
- Add notes about what was changed
- Remove temporary allowances after changes are complete

### **3. Use Consistent Formatting**
- Use the same emoji and structure across all protected files
- Make it easy for AI tools to recognize the protection pattern

### **4. Document Dependencies**
- If the file depends on other protected files, mention it
- If changes could affect other parts of the system, note it

### **5. Regular Review**
- Periodically review protected files
- Remove protection from files that no longer need it
- Update protection levels as needed

---

## 🎯 **Example Implementation**

Here's how to protect the MainSourceOfIncome component:

```typescript
/**
 * 🛡️ AI PROTECTION ZONE 🚨
 * 
 * This file is protected from AI modifications unless explicitly requested.
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT modify Formik integration or validation
 * - DO NOT change dropdown data handling
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This component handles main source of income selection
 * - Changes could affect mortgage calculation accuracy
 * - Requires thorough testing before any modifications
 * 
 * Last modified: 2024-01-15
 * Protected by: [Your Name]
 * File purpose: Main source of income dropdown component for mortgage calculator
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 */

import { useFormikContext } from 'formik'
// Rest of your existing code...
```

---

## 📋 **Quick Reference**

### **Protection Levels**
- 🛡️ **Basic**: Standard protection for most files
- 🚨 **Critical**: Enhanced protection for business-critical files
- ⚠️ **Legal**: Special protection for legal/content files

### **Common Protection Reasons**
- Business logic stability
- Legal content accuracy
- Database schema integrity
- API contract compliance
- User experience consistency

### **When to Remove Protection**
- File is deprecated or removed
- Protection is no longer needed
- File is being completely rewritten
- Explicit user request to remove protection

---

## 🔍 **Verification Checklist**

Before marking a file as protected, ensure:

- [ ] File contains stable, working code
- [ ] Changes could affect other parts of the system
- [ ] File handles critical business logic
- [ ] File contains legal or sensitive content
- [ ] File is part of a stable API contract
- [ ] File has been thoroughly tested

---

**Remember**: The goal is to protect important files while still allowing necessary modifications when explicitly requested. Use these templates consistently and update them as your project evolves.
