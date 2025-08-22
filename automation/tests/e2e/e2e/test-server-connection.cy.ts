describe('Test Server Connection', () => {
  it('should connect to API server', () => {
    cy.request('http://localhost:8003/api/v1/banks').then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it('should load home page', () => {
    cy.visit('http://localhost:5173');
    cy.get('body').should('exist');
  });

  it('should navigate to refinance page', () => {
    cy.visit('http://localhost:5173/services/refinance-mortgage/1', {
      timeout: 30000,
      failOnStatusCode: false
    });
    cy.get('body').should('exist');
  });
});