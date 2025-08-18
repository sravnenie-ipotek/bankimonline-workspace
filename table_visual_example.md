# 📋 How the Technical Map Table Should Look in Confluence

## 🎯 **Visual Example of the Table Structure**

When you paste this into Confluence, it will render as a properly formatted table with the following appearance:

---

## 🏗️ Architecture Overview

### System Architecture

| **Component** | **Technology Stack** | **Purpose** | **Status** | **Documentation Link** |
|---------------|---------------------|-------------|------------|------------------------|
| **Frontend** | React + TypeScript + Vite | Main user interface | ✅ Production | [Frontend Architecture](./frontend-architecture) |
| **Backend API** | Node.js + Express | REST API services | ✅ Production | [API Documentation](./api-docs) |
| **Database** | PostgreSQL | Primary data storage | ✅ Production | [Database Schema](./database-schema) |
| **Authentication** | JWT + bcrypt | User authentication | ✅ Production | [Auth System](./auth-system) |
| **File Storage** | Local + Cloud | Static assets & uploads | ✅ Production | [File Management](./file-management) |

---

## 🤖 Automation Tools & CI/CD

### Testing Automation

| **Tool** | **Purpose** | **Coverage** | **Status** | **Configuration** |
|----------|-------------|--------------|------------|-------------------|
| **Playwright** | E2E Testing | Credit/Mortgage calculators | ✅ Active | [Test Config](./playwright-config) |
| **Cypress** | Component Testing | UI components | ✅ Active | [Cypress Setup](./cypress-setup) |
| **Jest** | Unit Testing | Business logic | 🔄 Setup | [Jest Config](./jest-config) |
| **BrowserStack** | Cross-browser Testing | Multi-browser validation | ✅ Active | [BrowserStack Config](./browserstack) |

---

## 💰 Banking Features & Logic

### Calculator Systems

| **Calculator** | **Purpose** | **Steps** | **Status** | **Documentation** |
|----------------|-------------|-----------|------------|-------------------|
| **Credit Calculator** | Personal loan calculations | 4 steps | ✅ Production | [Credit Logic](./credit-calculator) |
| **Mortgage Calculator** | Home loan calculations | 4 steps | ✅ Production | [Mortgage Logic](./mortgage-calculator) |
| **Refinance Calculator** | Loan refinancing | 3 steps | ✅ Production | [Refinance Logic](./refinance-calculator) |

---

## 📊 **Confluence Table Formatting Tips**

### 1. **Table Structure**
- Use `|` to separate columns
- Use `-` for header separators
- Each row should have the same number of columns

### 2. **Status Indicators**
- ✅ **Active/Complete** - Green checkmark for working systems
- 🔄 **Setup/Development** - Blue arrows for in-progress items
- ⚠️ **Maintenance** - Yellow warning for items needing attention
- ❌ **Deprecated** - Red X for discontinued systems

### 3. **Column Alignment**
- **Bold headers** for better visibility
- **Consistent spacing** between columns
- **Clear descriptions** in each cell

### 4. **Link Formatting**
- Use `[Link Text](./link-path)` format
- Replace `./link-path` with actual Confluence page links
- Example: `[Frontend Architecture](https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/123456789)`

---

## 🎨 **Confluence Styling Options**

### **Table Styling**
```markdown
{panel:title=🏗️ Architecture Overview|borderStyle=solid|borderColor=#ccc|titleBGColor=#f0f0f0|bgColor=#ffffff}

| **Component** | **Technology Stack** | **Purpose** | **Status** | **Documentation Link** |
|---------------|---------------------|-------------|------------|------------------------|
| **Frontend** | React + TypeScript + Vite | Main user interface | ✅ Production | [Frontend Architecture](./frontend-architecture) |

{panel}
```

### **Color-Coded Status**
- 🟢 **Green** - Active/Complete systems
- 🟡 **Yellow** - In development/Setup
- 🔴 **Red** - Issues/Deprecated
- 🔵 **Blue** - Information/Planning

---

## 📱 **Mobile-Friendly Table Design**

For better mobile viewing, consider using **Info Panels** instead of wide tables:

```markdown
{info:title=Frontend Architecture}
**Technology Stack:** React + TypeScript + Vite
**Purpose:** Main user interface
**Status:** ✅ Production
**Documentation:** [Frontend Architecture](./frontend-architecture)
{info}
```

---

## 🔧 **Confluence Table Shortcuts**

### **Quick Table Creation**
1. Type `||` and press Tab
2. Add column headers separated by `||`
3. Press Enter
4. Add data rows

### **Table Formatting**
- **Bold:** `*text*`
- **Italic:** `_text_`
- **Code:** `{{code}}`
- **Links:** `[text](url)`

---

## 📋 **Example of Final Appearance**

When properly formatted in Confluence, your table will look like this:

---

### 🏗️ System Architecture

| **Component** | **Technology Stack** | **Purpose** | **Status** | **Documentation Link** |
|---------------|---------------------|-------------|------------|------------------------|
| **Frontend** | React + TypeScript + Vite | Main user interface | ✅ Production | [Frontend Architecture](./frontend-architecture) |
| **Backend API** | Node.js + Express | REST API services | ✅ Production | [API Documentation](./api-docs) |
| **Database** | PostgreSQL | Primary data storage | ✅ Production | [Database Schema](./database-schema) |
| **Authentication** | JWT + bcrypt | User authentication | ✅ Production | [Auth System](./auth-system) |
| **File Storage** | Local + Cloud | Static assets & uploads | ✅ Production | [File Management](./file-management) |

---

## 🎯 **Key Visual Elements**

1. **Clear Headers** - Bold, descriptive column titles
2. **Status Icons** - Visual indicators for quick scanning
3. **Consistent Formatting** - Uniform spacing and alignment
4. **Actionable Links** - Clickable documentation references
5. **Color Coding** - Status-based visual hierarchy

This structure will create a professional, easy-to-navigate technical map that your team can use to understand the entire system architecture at a glance.
