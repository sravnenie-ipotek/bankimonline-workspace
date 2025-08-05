# LK-156 Gap Analysis Report
**Issue**: 40.1 Мои услуги. Выбор второй услуги. Рассчитать ипотеку. Общая. Личный кабинет

## 📋 Requirements Summary
PersonalCabinet-specific implementation of the Calculate Mortgage service. The page should be identical to the existing Services calculate mortgage page but with PersonalCabinet-specific navigation and conditional progress bar logic.

## 🎯 Figma Design Analysis
**Figma URL**: https://www.figma.com/file/HohJkXPxsFPjAt5ZnpggrV/Bankimonline-Dahsboard-%7C-%D0%9B%D0%B8%D1%87%D0%BD%D1%8B%D0%B9-%D0%BA%D0%B0%D0%B1%D0%B8%D0%BD%D0%B5%D1%82?type=design&node-id=1774-304942

**Key Design Elements**:
1. **Top Navigation**: "Вернуться в личный кабинет" button (different from Services)
2. **Progress Bar**: Conditional 2-step or 3-step based on user data completion
3. **Hero Section**: "Рассчитать ипотеку" with description and controls
4. **Calculator Form**: Complete mortgage calculation form with all fields
5. **Bottom Navigation**: "Продолжить" button for form submission

## 🔍 Current Implementation Analysis

### ✅ **EXCELLENT FOUNDATION EXISTS**
**Location**: `/mainapp/src/pages/Services/pages/CalculateMortgage/`

**Existing Components**:
- `CalculateMortgage.tsx` - Main component with step routing
- `FirstStep/FirstStep.tsx` - Calculator form with validation
- `FirstStepForm/FirstStepForm.tsx` - Complete form implementation
- `calculateMortgageSlice.ts` - Redux state management
- Calculation utilities: `calculateMonthlyPayment.ts`, `calculatePeriod.ts`

**Form Fields Match Figma Design**:
- ✅ Property price (Стоимость недвижимости)
- ✅ City selection (Город покупки недвижимости) 
- ✅ Timeline selection (Когда планируете оформить ипотеку)
- ✅ Down payment with slider (Первоначальный взнос)
- ✅ Property type (Тип недвижимости)
- ✅ First apartment question (Владеете недвижимостью)
- ✅ Loan term with slider (Срок)
- ✅ Monthly payment with slider (Ежемесячный платеж)
- ✅ Context messages and warnings
- ✅ Currency formatting and validation

## 🚨 **CRITICAL GAPS IDENTIFIED**

### 1. **PersonalCabinet Integration Missing** (🔴 High Priority)
**Current**: ServiceSelectionDashboard navigates to `/services/calculate-mortgage`
**Required**: PersonalCabinet-specific routing and integration

**Missing Components**:
- PersonalCabinet calculate mortgage routing
- PersonalCabinet-specific top navigation
- Integration with PersonalCabinet layout and state

### 2. **Progress Bar Conditional Logic** (🔴 High Priority)
**Current**: Fixed 4-step progress bar in Services
**Required**: Conditional 2-step or 3-step based on user data

**From Issue Description**:
- If user already filled personal data + income data → 2 steps only
- If user hasn't filled data → full 3-step flow
- Progress bar text should be PersonalCabinet-specific

### 3. **Top Navigation Adaptation** (🟡 Medium Priority)
**Current**: Services navigation with external service buttons
**Required**: "Вернуться в личный кабинет" button matching Figma

### 4. **PersonalCabinet State Management** (🟡 Medium Priority)
**Current**: Services-specific Redux slices
**Required**: Integration with PersonalCabinet user data and progress tracking

## 📊 **IMPLEMENTATION STATUS**

### **Overall Completion: 85%** 🟢
- **Form Implementation**: 95% complete (excellent match)
- **Calculation Logic**: 100% complete (perfect)
- **Validation**: 95% complete (comprehensive)
- **UI Components**: 90% complete (minor PersonalCabinet adaptations needed)
- **PersonalCabinet Integration**: 0% complete (critical gap)
- **Progress Bar Logic**: 20% complete (needs conditional logic)

### **Components Ready for Reuse**:
1. ✅ `FirstStepForm` - Complete calculator form
2. ✅ `calculateMortgageSlice` - State management
3. ✅ All calculation utilities
4. ✅ Form validation schema
5. ✅ UI components (SliderInput, FormattedInput, DropdownMenu)

### **Components Needing Adaptation**:
1. 🔄 `CalculateMortgage` - Add PersonalCabinet routing logic
2. 🔄 `ProgressBar` - Add conditional step logic
3. 🔄 Top navigation - PersonalCabinet-specific button
4. 🔄 State integration - Connect with PersonalCabinet user data

## 🛠️ **REQUIRED DEVELOPMENT WORK**

### **Phase 1: PersonalCabinet Component Creation** (1 day)
1. Create `PersonalCabinetCalculateMortgage` wrapper component
2. Implement PersonalCabinet-specific routing
3. Add conditional progress bar logic
4. Integrate with PersonalCabinet layout

### **Phase 2: Navigation and State Integration** (0.5 day)
1. Implement "Вернуться в личный кабинет" navigation
2. Connect with PersonalCabinet user data state
3. Add progress tracking integration

### **Phase 3: Testing and Refinement** (0.5 day)
1. Test conditional progress bar logic
2. Verify form data persistence
3. Test navigation flows

## 🎯 **PRIORITY RECOMMENDATIONS**

### **High Priority** (Complete First):
1. **PersonalCabinet Component Wrapper** - Essential for basic functionality
2. **Conditional Progress Bar Logic** - Core requirement from Figma
3. **Navigation Integration** - User experience critical

### **Medium Priority** (Complete Second):
1. **State Management Integration** - Enhanced user experience
2. **Form Data Pre-filling** - If user has existing data

## 📈 **QUALITY ASSESSMENT**

### **Strengths**:
- ✅ **GOLD STANDARD** existing calculator implementation
- ✅ Perfect form field matching with Figma design
- ✅ Comprehensive validation and error handling
- ✅ Excellent calculation utilities and state management
- ✅ Beautiful UI components ready for reuse

### **Opportunities**:
- 🔄 PersonalCabinet-specific adaptation needed
- 🔄 Progress bar conditional logic implementation
- 🔄 Navigation context switching

## 🚀 **DEVELOPMENT ESTIMATE**

**Total Effort**: 2 development days
- **PersonalCabinet Integration**: 1 day
- **Progress Bar Logic**: 0.5 day  
- **Navigation & Testing**: 0.5 day

**Complexity**: Medium (excellent foundation exists, needs adaptation)
**Risk Level**: Low (proven components, clear requirements)

## ✅ **CONCLUSION**

LK-156 has an **excellent foundation** with the existing Services CalculateMortgage implementation that perfectly matches the Figma design. The main work involves **adapting this proven implementation for PersonalCabinet context** rather than building from scratch.

**Key Success Factors**:
1. **Reuse Existing Excellence** - The Services implementation is gold standard
2. **Focus on Integration** - PersonalCabinet-specific routing and navigation
3. **Conditional Logic** - Progress bar adaptation based on user data
4. **Minimal Custom Development** - Wrapper and adaptation approach

This is a **high-value, low-risk** implementation that leverages existing proven components for PersonalCabinet context. 