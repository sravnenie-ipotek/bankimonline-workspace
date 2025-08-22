
describe('Form Basic Validation', () => {
  it('should load mortgage form', () => {
    cy.visit('/services/calculate-mortgage/1')
    
    // Check for form structure
    cy.get('form, [role="form"], div').then($elements => {
      cy.log(`Page has ${$elements.length} potential form containers`)
    })
    
    // Check for labels
    cy.get('label').then($labels => {
      cy.log(`Found ${$labels.length} form labels`)
      
      if ($labels.length > 0) {
        $labels.slice(0, 3).each((index, label) => {
          cy.log(`Label ${index + 1}: ${label.textContent}`)
        })
      }
    })
  })
})
