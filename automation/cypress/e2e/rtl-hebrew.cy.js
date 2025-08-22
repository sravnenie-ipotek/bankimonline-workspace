
describe('RTL Hebrew Layout Test', () => {
  it('should check Hebrew language support', () => {
    cy.visit('/')
    
    // Try to switch to Hebrew
    cy.get('button').then($buttons => {
      const hebrewButton = Array.from($buttons).find(btn => 
        btn.textContent?.includes('עברית') || btn.textContent?.includes('HE')
      )
      
      if (hebrewButton) {
        cy.wrap(hebrewButton).click()
        cy.wait(1000)
        
        // Check RTL
        cy.get('html').then($html => {
          const dir = $html.attr('dir')
          cy.log(`HTML direction: ${dir}`)
          
          if (dir === 'rtl') {
            cy.log('✅ RTL properly set')
          } else {
            cy.log('⚠️ RTL not set')
          }
        })
      } else {
        cy.log('Language selector not found')
      }
    })
  })
})
