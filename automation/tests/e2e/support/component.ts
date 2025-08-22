// ***********************************************************
// This file is processed and loaded automatically before
// component test files.
// You can change the location of this file or turn off loading
// the support files with the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import custom CSS styles for component testing
import '../../src/index.css'

// Import necessary providers for React components
import { mount } from 'cypress/react18'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../src/i18n'
import { store } from '../../src/store'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      /**
       * Mounts a React component with all necessary providers
       */
      mountWithProviders(component: React.ReactNode): Chainable<any>
    }
  }
}

// Custom mount command with all providers
Cypress.Commands.add('mountWithProviders', (component: React.ReactNode) => {
  return cy.mount(
    <Provider store={store}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {component}
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
  )
})

Cypress.Commands.add('mount', mount)

// Example use:
// cy.mount(<MyComponent />)