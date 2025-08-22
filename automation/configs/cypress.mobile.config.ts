import { defineConfig } from 'cypress'
import baseConfig from './cypress.config'

/**
 * Mobile-specific Cypress configuration
 * Extends base config with mobile viewport settings
 */
export default defineConfig({
  ...baseConfig,
  e2e: {
    ...baseConfig.e2e,
    
    // Mobile viewport settings
    viewportWidth: 375,   // iPhone X/11/12 width
    viewportHeight: 812,  // iPhone X/11/12 height
    
    // Mobile-specific test pattern
    specPattern: [
      './tests/mobile/**/*.cy.{js,ts}',
      './tests/e2e/mobile-viewport-test.cy.ts',
      './tests/e2e/**/*mobile*.cy.{js,ts}'
    ],
    
    // Mobile user agent (optional - for sites that detect mobile via UA)
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    
    // Mobile-specific environment variables
    env: {
      ...baseConfig.e2e?.env,
      isMobile: true,
      deviceType: 'mobile',
      orientation: 'portrait'
    },
    
    // Adjust timeouts for potentially slower mobile rendering
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    // Mobile test retries (mobile can be flakier)
    retries: {
      runMode: 3,
      openMode: 1
    },
    
    // SSL Certificate handling for HTTPS testing
    chromeWebSecurity: false,
    
    // Additional mobile testing configurations
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalWebKitSupport: true, // For Safari mobile testing
  }
})