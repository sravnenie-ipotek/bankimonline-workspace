describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display login button on homepage', () => {
    cy.get('[data-cy=login-button]').should('be.visible')
  })

  it('should open phone verification modal when clicking login', () => {
    cy.get('[data-cy=login-button]').click()
    
    // Check modal is visible
    cy.get('[class*="modalContainer"]').should('be.visible')
    cy.contains('הזן מספר טלפון').should('be.visible')
  })

  it('should validate phone number format', () => {
    cy.get('[data-cy=login-button]').click()
    
    // Try invalid phone number
    cy.get('input[placeholder*="שם"]').type('Test User')
    cy.get('.react-phone-input-2 input').clear().type('123')
    
    // Check for validation error
    cy.get('[class*="errorMessage"]').should('be.visible')
    cy.contains('פורמט הטלפון חייב להיות').should('be.visible')
  })

  it('should validate name field', () => {
    cy.get('[data-cy=login-button]').click()
    
    // Try empty name
    cy.get('.react-phone-input-2 input').clear().type('972544123456')
    cy.get('button').contains('המשך').click()
    
    // Check for validation error
    cy.get('[class*="errorMessage"]').should('be.visible')
  })

  it('should successfully submit valid phone verification', () => {
    // Mock the SMS API response
    cy.mockApiResponse('send-sms', { success: true, message: 'SMS sent' })
    
    cy.get('[data-cy=login-button]').click()
    
    // Fill valid data
    cy.fixture('testUser.json').then((testData) => {
      cy.get('input[placeholder*="שם"]').type(testData.validUser.name)
      cy.get('.react-phone-input-2 input').clear().type(testData.validUser.phone)
    })
    
    // Submit
    cy.get('button').contains('המשך').should('not.be.disabled').click()
    
    // Should navigate to OTP screen
    cy.wait('@send-smsRequest')
    cy.get('[class*="otp-input"]').should('be.visible')
  })

  it('should handle OTP verification', () => {
    // Setup: Get to OTP screen
    cy.mockApiResponse('send-sms', { success: true })
    cy.mockApiResponse('verify-otp', { 
      success: true, 
      token: 'test-jwt-token',
      user: { name: 'Test User', phone: '972544123456' }
    })
    
    cy.get('[data-cy=login-button]').click()
    cy.fixture('testUser.json').then((testData) => {
      cy.get('input[placeholder*="שם"]').type(testData.validUser.name)
      cy.get('.react-phone-input-2 input').clear().type(testData.validUser.phone)
    })
    cy.get('button').contains('המשך').click()
    
    // Enter OTP
    cy.wait('@send-smsRequest')
    '123456'.split('').forEach((digit, index) => {
      cy.get(`input[data-index="${index}"]`).type(digit)
    })
    
    // Verify OTP
    cy.get('button').contains('אמת').click()
    cy.wait('@verify-otpRequest')
    
    // Should be logged in
    cy.window().its('localStorage.ACCESS_TOKEN').should('exist')
    cy.url().should('include', '/personal-cabinet')
  })

  it('should handle incorrect OTP', () => {
    // Setup: Get to OTP screen
    cy.mockApiResponse('send-sms', { success: true })
    cy.mockApiResponse('verify-otp', { 
      success: false, 
      message: 'Invalid OTP'
    })
    
    cy.get('[data-cy=login-button]').click()
    cy.fixture('testUser.json').then((testData) => {
      cy.get('input[placeholder*="שם"]').type(testData.validUser.name)
      cy.get('.react-phone-input-2 input').clear().type(testData.validUser.phone)
    })
    cy.get('button').contains('המשך').click()
    
    // Enter wrong OTP
    cy.wait('@send-smsRequest')
    '999999'.split('').forEach((digit, index) => {
      cy.get(`input[data-index="${index}"]`).type(digit)
    })
    
    // Try to verify
    cy.get('button').contains('אמת').click()
    cy.wait('@verify-otpRequest')
    
    // Should show error
    cy.contains('קוד שגוי').should('be.visible')
  })

  it('should allow user to resend OTP', () => {
    // Setup: Get to OTP screen
    cy.mockApiResponse('send-sms', { success: true })
    
    cy.get('[data-cy=login-button]').click()
    cy.fixture('testUser.json').then((testData) => {
      cy.get('input[placeholder*="שם"]').type(testData.validUser.name)
      cy.get('.react-phone-input-2 input').clear().type(testData.validUser.phone)
    })
    cy.get('button').contains('המשך').click()
    
    cy.wait('@send-smsRequest')
    
    // Click resend
    cy.get('button').contains('שלח שוב').click()
    
    // Should make another API call
    cy.wait('@send-smsRequest')
  })

  it('should persist login state', () => {
    // Mock successful login
    cy.window().then((win) => {
      win.localStorage.setItem('ACCESS_TOKEN', 'test-token')
      win.localStorage.setItem('USER_DATA', JSON.stringify({
        name: 'Test User',
        phone: '972544123456'
      }))
    })
    
    // Reload page
    cy.reload()
    
    // Should still be logged in
    cy.window().its('localStorage.ACCESS_TOKEN').should('eq', 'test-token')
    
    // Should show user menu instead of login button
    cy.get('[data-cy=user-menu]').should('be.visible')
    cy.get('[data-cy=login-button]').should('not.exist')
  })

  it('should handle logout', () => {
    // Setup: Login first
    cy.window().then((win) => {
      win.localStorage.setItem('ACCESS_TOKEN', 'test-token')
      win.localStorage.setItem('USER_DATA', JSON.stringify({
        name: 'Test User',
        phone: '972544123456'
      }))
    })
    cy.reload()
    
    // Click logout
    cy.get('[data-cy=user-menu]').click()
    cy.get('[data-cy=logout-button]').click()
    
    // Confirm logout
    cy.get('button').contains('כן, צא').click()
    
    // Should clear storage and redirect
    cy.window().its('localStorage.ACCESS_TOKEN').should('not.exist')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.get('[data-cy=login-button]').should('be.visible')
  })
})