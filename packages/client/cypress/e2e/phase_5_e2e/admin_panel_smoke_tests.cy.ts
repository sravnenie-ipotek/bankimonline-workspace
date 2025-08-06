/// <reference types="cypress" />

describe('Phase 5 Admin Panel Smoke Tests - Dropdown CRUD Operations', () => {
  const ADMIN_URL = 'http://localhost:5173/admin';
  const API_BASE = 'http://localhost:8003';
  
  // Admin credentials (adjust based on your setup)
  const adminCredentials = {
    email: 'admin@bankim.com',
    password: 'Admin123!'
  };
  
  // Test dropdown data
  const testDropdown = {
    screen: 'test_screen',
    fieldName: 'test_dropdown',
    options: [
      { value: 'option1', labelEn: 'Option One', labelHe: 'אפשרות אחת', labelRu: 'Вариант один' },
      { value: 'option2', labelEn: 'Option Two', labelHe: 'אפשרות שתיים', labelRu: 'Вариант два' },
      { value: 'option3', labelEn: 'Option Three', labelHe: 'אפשרות שלוש', labelRu: 'Вариант три' }
    ],
    placeholderEn: 'Select an option',
    placeholderHe: 'בחר אפשרות',
    placeholderRu: 'Выберите вариант',
    labelEn: 'Test Dropdown',
    labelHe: 'תפריט בדיקה',
    labelRu: 'Тестовый список'
  };

  beforeEach(() => {
    // Clear session
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login to admin panel
    cy.visit(ADMIN_URL);
    
    // Handle login if required
    cy.get('body').then($body => {
      if ($body.find('[data-testid="admin-login-form"]').length) {
        cy.get('[data-testid="admin-email"]').type(adminCredentials.email);
        cy.get('[data-testid="admin-password"]').type(adminCredentials.password);
        cy.get('[data-testid="admin-login-button"]').click();
        
        // Wait for redirect to admin dashboard
        cy.url().should('include', '/admin/dashboard');
      }
    });
  });

  describe('Content Management CRUD Operations', () => {
    it('should navigate to content management section', () => {
      // Navigate to content management
      cy.get('[data-testid="admin-nav-content"]').click();
      cy.url().should('include', '/admin/content');
      
      // Verify content management page loads
      cy.get('[data-testid="content-management-page"]').should('be.visible');
      cy.contains('Content Management').should('be.visible');
    });

    it('should create a new dropdown with all components', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Click create new dropdown button
      cy.get('[data-testid="create-dropdown-button"]').click();
      
      // Fill dropdown details
      cy.get('[data-testid="dropdown-screen-location"]').type(testDropdown.screen);
      cy.get('[data-testid="dropdown-field-name"]').type(testDropdown.fieldName);
      
      // Add label translations
      cy.get('[data-testid="label-en"]').type(testDropdown.labelEn);
      cy.get('[data-testid="label-he"]').type(testDropdown.labelHe);
      cy.get('[data-testid="label-ru"]').type(testDropdown.labelRu);
      
      // Add placeholder translations
      cy.get('[data-testid="placeholder-en"]').type(testDropdown.placeholderEn);
      cy.get('[data-testid="placeholder-he"]').type(testDropdown.placeholderHe);
      cy.get('[data-testid="placeholder-ru"]').type(testDropdown.placeholderRu);
      
      // Add options
      testDropdown.options.forEach((option, index) => {
        cy.get('[data-testid="add-option-button"]').click();
        
        cy.get(`[data-testid="option-value-${index}"]`).type(option.value);
        cy.get(`[data-testid="option-label-en-${index}"]`).type(option.labelEn);
        cy.get(`[data-testid="option-label-he-${index}"]`).type(option.labelHe);
        cy.get(`[data-testid="option-label-ru-${index}"]`).type(option.labelRu);
      });
      
      // Save dropdown
      cy.get('[data-testid="save-dropdown-button"]').click();
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('contain', 'Dropdown created successfully');
    });

    it('should verify the created dropdown appears in the list', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Search for the test dropdown
      cy.get('[data-testid="content-search"]').type(testDropdown.fieldName);
      
      // Verify it appears in the list
      cy.get('[data-testid="content-list"]').should('contain', testDropdown.fieldName);
      cy.get('[data-testid="content-list"]').should('contain', testDropdown.screen);
    });

    it('should edit an existing dropdown', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Search for the test dropdown
      cy.get('[data-testid="content-search"]').type(testDropdown.fieldName);
      
      // Click edit button
      cy.get(`[data-testid="edit-${testDropdown.fieldName}"]`).click();
      
      // Modify the label
      const updatedLabel = 'Updated Test Dropdown';
      cy.get('[data-testid="label-en"]').clear().type(updatedLabel);
      
      // Add a new option
      cy.get('[data-testid="add-option-button"]').click();
      const newOptionIndex = testDropdown.options.length;
      cy.get(`[data-testid="option-value-${newOptionIndex}"]`).type('option4');
      cy.get(`[data-testid="option-label-en-${newOptionIndex}"]`).type('Option Four');
      cy.get(`[data-testid="option-label-he-${newOptionIndex}"]`).type('אפשרות ארבע');
      cy.get(`[data-testid="option-label-ru-${newOptionIndex}"]`).type('Вариант четыре');
      
      // Save changes
      cy.get('[data-testid="save-dropdown-button"]').click();
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('contain', 'Dropdown updated successfully');
    });

    it('should reflect changes in frontend without redeploy', () => {
      // Create a dropdown for mortgage_step1
      cy.get('[data-testid="admin-nav-content"]').click();
      cy.get('[data-testid="create-dropdown-button"]').click();
      
      const frontendDropdown = {
        screen: 'mortgage_step1',
        fieldName: 'admin_test_field',
        labelEn: 'Admin Test Field',
        placeholderEn: 'Select admin test option',
        options: [
          { value: 'admin_opt1', labelEn: 'Admin Option 1' }
        ]
      };
      
      // Fill minimal required fields
      cy.get('[data-testid="dropdown-screen-location"]').type(frontendDropdown.screen);
      cy.get('[data-testid="dropdown-field-name"]').type(frontendDropdown.fieldName);
      cy.get('[data-testid="label-en"]').type(frontendDropdown.labelEn);
      cy.get('[data-testid="placeholder-en"]').type(frontendDropdown.placeholderEn);
      
      // Add one option
      cy.get('[data-testid="add-option-button"]').click();
      cy.get('[data-testid="option-value-0"]').type(frontendDropdown.options[0].value);
      cy.get('[data-testid="option-label-en-0"]').type(frontendDropdown.options[0].labelEn);
      
      // Save
      cy.get('[data-testid="save-dropdown-button"]').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
      
      // Open frontend in new tab/window and verify
      cy.visit('http://localhost:5173/calculate-mortgage');
      
      // Clear cache to force fresh data
      cy.window().then(win => {
        win.localStorage.clear();
      });
      cy.reload();
      
      // Verify the new dropdown appears
      cy.get(`[data-testid="${frontendDropdown.fieldName}-dropdown"]`).should('exist');
      cy.get(`[data-testid="${frontendDropdown.fieldName}-dropdown"]`).should('contain', frontendDropdown.labelEn);
    });

    it('should disable/enable dropdown content', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Search for test dropdown
      cy.get('[data-testid="content-search"]').type(testDropdown.fieldName);
      
      // Click disable button
      cy.get(`[data-testid="disable-${testDropdown.fieldName}"]`).click();
      
      // Confirm disable action
      cy.get('[data-testid="confirm-disable-button"]').click();
      
      // Verify status changed to disabled
      cy.get(`[data-testid="status-${testDropdown.fieldName}"]`).should('contain', 'Disabled');
      
      // Re-enable the dropdown
      cy.get(`[data-testid="enable-${testDropdown.fieldName}"]`).click();
      
      // Verify status changed back to active
      cy.get(`[data-testid="status-${testDropdown.fieldName}"]`).should('contain', 'Active');
    });

    it('should delete a dropdown with confirmation', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Search for test dropdown
      cy.get('[data-testid="content-search"]').type(testDropdown.fieldName);
      
      // Click delete button
      cy.get(`[data-testid="delete-${testDropdown.fieldName}"]`).click();
      
      // Verify confirmation dialog appears
      cy.get('[data-testid="delete-confirmation-dialog"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation-dialog"]').should('contain', 'Are you sure');
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // Verify success message
      cy.get('[data-testid="success-message"]').should('contain', 'Dropdown deleted successfully');
      
      // Verify dropdown no longer appears in list
      cy.get('[data-testid="content-list"]').should('not.contain', testDropdown.fieldName);
    });
  });

  describe('Bulk Operations', () => {
    it('should export dropdown content to CSV', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Select screen to export
      cy.get('[data-testid="export-screen-select"]').select('mortgage_step1');
      
      // Click export button
      cy.get('[data-testid="export-csv-button"]').click();
      
      // Verify download started (check for success message since actual download is hard to test)
      cy.get('[data-testid="export-success"]').should('contain', 'Export completed');
    });

    it('should import dropdown content from CSV', () => {
      cy.get('[data-testid="admin-nav-content"]').click();
      
      // Click import button
      cy.get('[data-testid="import-csv-button"]').click();
      
      // Upload CSV file
      const csvContent = `screen_location,field_name,component_type,value,label_en,label_he,label_ru
test_import,imported_field,dropdown,,Imported Field,שדה מיובא,Импортированное поле
test_import,imported_field,option,imp_opt1,Imported Option 1,אפשרות מיובאת 1,Импортированный вариант 1`;
      
      cy.get('[data-testid="csv-file-input"]').attachFile({
        fileContent: csvContent,
        fileName: 'import_test.csv',
        mimeType: 'text/csv'
      });
      
      // Confirm import
      cy.get('[data-testid="confirm-import-button"]').click();
      
      // Verify success
      cy.get('[data-testid="import-success"]').should('contain', 'Import completed successfully');
      
      // Verify imported content appears
      cy.get('[data-testid="content-search"]').type('imported_field');
      cy.get('[data-testid="content-list"]').should('contain', 'imported_field');
    });
  });

  describe('Translation Management', () => {
    it('should show translation coverage statistics', () => {
      cy.get('[data-testid="admin-nav-translations"]').click();
      
      // Verify translation stats are displayed
      cy.get('[data-testid="translation-coverage-en"]').should('exist');
      cy.get('[data-testid="translation-coverage-he"]').should('exist');
      cy.get('[data-testid="translation-coverage-ru"]').should('exist');
      
      // Should show percentage for each language
      cy.get('[data-testid="translation-coverage-en"]').should('contain', '%');
    });

    it('should identify and highlight missing translations', () => {
      cy.get('[data-testid="admin-nav-translations"]').click();
      
      // Filter by missing translations
      cy.get('[data-testid="filter-missing-translations"]').click();
      
      // If there are missing translations, they should be highlighted
      cy.get('[data-testid="missing-translation-item"]').each($el => {
        cy.wrap($el).should('have.class', 'missing-translation-highlight');
      });
    });

    it('should allow inline translation editing', () => {
      cy.get('[data-testid="admin-nav-translations"]').click();
      
      // Find a content item
      cy.get('[data-testid="translation-item"]').first().within(() => {
        // Click edit for Hebrew translation
        cy.get('[data-testid="edit-translation-he"]').click();
        
        // Type new translation
        cy.get('[data-testid="translation-input-he"]').clear().type('עדכון תרגום');
        
        // Save
        cy.get('[data-testid="save-translation"]').click();
      });
      
      // Verify success
      cy.get('[data-testid="translation-saved"]').should('be.visible');
    });
  });

  describe('Performance and Monitoring', () => {
    it('should show cache statistics', () => {
      cy.get('[data-testid="admin-nav-monitoring"]').click();
      
      // Verify cache stats are displayed
      cy.get('[data-testid="cache-hit-rate"]').should('exist');
      cy.get('[data-testid="cache-size"]').should('exist');
      cy.get('[data-testid="cache-entries"]').should('exist');
    });

    it('should allow cache clearing', () => {
      cy.get('[data-testid="admin-nav-monitoring"]').click();
      
      // Click clear cache button
      cy.get('[data-testid="clear-cache-button"]').click();
      
      // Confirm action
      cy.get('[data-testid="confirm-clear-cache"]').click();
      
      // Verify success
      cy.get('[data-testid="cache-cleared-message"]').should('contain', 'Cache cleared successfully');
      
      // Verify cache stats show 0
      cy.get('[data-testid="cache-entries"]').should('contain', '0');
    });
  });
});