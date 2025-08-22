
describe('Dropdown Data Test', () => {
  it('should check API endpoint', () => {
    cy.request('/api/v1/calculation-parameters?business_path=mortgage').then(response => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('data')
      expect(response.body.data).to.have.property('property_ownership_ltvs')
      cy.log('API returns property ownership data')
    })
  })
  
  it('should find form elements on mortgage page', () => {
    cy.visit('/services/calculate-mortgage/1')
    
    // Check for any form inputs
    cy.get('input, select, [role="combobox"], .MuiSelect-root').then($elements => {
      cy.log(`Found ${$elements.length} form elements`)
      expect($elements.length).to.be.greaterThan(0)
    })
  })
})
