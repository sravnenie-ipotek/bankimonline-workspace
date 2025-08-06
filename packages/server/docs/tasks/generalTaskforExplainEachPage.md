# **GENERAL TASK: CREATE PAGE DOCUMENTATION**

## **Objective**
Create comprehensive developer documentation for each page in the BankimOnline application, covering technologies, references, logical explanations, and implementation details.

## **Scope**
Document all pages identified in the routing structure, including:
- **Main Pages**: Home, About, Contacts, Cooperation, Services, etc.
- **Service Pages**: CalculateMortgage, CalculateCredit, RefinanceMortgage, RefinanceCredit
- **Bank Pages**: Apoalim, Discount, Leumi, Beinleumi
- **Special Pages**: Registration, AuthModal, Admin, PersonalCabinet, etc.
- **Legal Pages**: PrivacyPolicy, Terms, Cookie, Refund
- **Business Pages**: TendersForBrokers, TendersForLawyers, Vacancies, etc.

## **Documentation Structure for Each Page**

### **1. Page Overview**
- **Page Name**: [Page Name]
- **Route Path**: [URL path]
- **Purpose**: [Business purpose and user journey]
- **Target Audience**: [End users, internal users, etc.]
- **Access Level**: [Public, Authenticated, Admin, etc.]

### **2. Technology Stack**
- **Frontend Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit (RTK)
- **Styling**: SCSS modules with classnames/bind
- **Routing**: React Router v6
- **Content Management**: Database-first content system with useContentApi hook
- **Internationalization**: react-i18next (if applicable)
- **UI Components**: Custom component library
- **Testing**: Cypress E2E tests

### **3. Key Dependencies & Imports**
```typescript
// List all critical imports and their purposes
import { useContentApi } from '@src/hooks/useContentApi'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
// ... other imports
```

### **4. Database-First Content System Integration**
- **Content Key**: [e.g., 'home_page', 'about_page']
- **Content Structure**: [Describe the content structure from database]
- **Fallback Strategy**: Cache → Database → File system
- **Loading States**: [How loading/error states are handled]

### **5. State Management**
- **Redux Slices**: [List relevant slices]
- **Local State**: [useState hooks and their purposes]
- **Global State**: [Redux selectors and actions used]

### **6. User Actions & Interactions**
- **Action Count**: [Total number of user actions]
- **Key Interactions**: [List main user interactions]
- **Event Handlers**: [Important event handlers and their purposes]
- **Navigation**: [How users navigate to/from this page]

### **7. Component Architecture**
- **Main Component**: [Primary component structure]
- **Child Components**: [List of imported components]
- **Layout Components**: [Header, Footer, Sidebar integration]
- **Modal Components**: [Any modal dialogs]

### **8. Styling & Responsive Design**
- **SCSS Module**: [Main style file]
- **Responsive Breakpoints**: [Mobile, tablet, desktop]
- **Theme Integration**: [Dark/light mode if applicable]
- **Animation**: [Any animations or transitions]

### **9. Error Handling & Edge Cases**
- **Error Boundaries**: [Error handling strategy]
- **Loading States**: [Loading indicators and skeleton screens]
- **Empty States**: [How empty data is handled]
- **Validation**: [Form validation if applicable]

### **10. Testing Strategy**
- **Cypress Tests**: [E2E test files and scenarios]
- **Unit Tests**: [Component testing if applicable]
- **Integration Tests**: [API integration testing]
- **Accessibility**: [A11y considerations]

### **11. Performance Considerations**
- **Code Splitting**: [Lazy loading implementation]
- **Bundle Size**: [Component size impact]
- **Caching**: [Content caching strategy]
- **Optimization**: [Performance optimizations]

### **12. Internationalization (i18n)**
- **Translation Keys**: [Key translation files]
- **Language Support**: [Supported languages]
- **RTL Support**: [Right-to-left language handling]
- **Cultural Considerations**: [Localization details]

### **13. Integration Points**
- **API Endpoints**: [Backend API calls]
- **External Services**: [Third-party integrations]
- **Analytics**: [Tracking and monitoring]
- **SEO**: [Search engine optimization]

### **14. Development Notes**
- **Known Issues**: [Current bugs or limitations]
- **Technical Debt**: [Areas for improvement]
- **Future Enhancements**: [Planned features]
- **Migration Notes**: [Database-first migration status]

### **15. Code Examples**
```typescript
// Key code snippets showing:
// - Content API usage
// - State management
// - Event handlers
// - Component structure
```

## **Documentation Format**
Create individual `.md` files for each page in a `docs/pages/` directory with the following naming convention:
- `home-page.md`
- `about-page.md`
- `contacts-page.md`
- etc.

## **Quality Standards**
- **Completeness**: All sections must be filled
- **Accuracy**: Code examples must match actual implementation
- **Clarity**: Use clear, developer-friendly language
- **Consistency**: Follow the same structure across all pages
- **Maintainability**: Easy to update as code changes

## **Deliverables**
1. **Individual page documentation files** (`.md` format)
2. **Page documentation index** (master list with links)
3. **Architecture overview** (how pages relate to each other)
4. **Development workflow guide** (how to use this documentation)

---

This general task description provides a comprehensive framework for documenting each page in your application. Each page will have its own detailed markdown file covering all the aspects mentioned above, making it easy for developers to understand the technology stack, implementation details, and maintenance requirements for any given page.
