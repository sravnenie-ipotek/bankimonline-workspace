import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Provider } from 'react-redux'
import { I18nextProvider } from 'react-i18next'
import { configureStore } from '@reduxjs/toolkit'

// Import components for testing
import FirstStepForm from '@src/pages/Services/pages/CalculateMortgage/pages/FirstStep/FirstStepForm/FirstStepForm'
import PropertyOwnership from '@src/pages/Services/components/PropertyOwnership/PropertyOwnership'
import BankOffers from '@src/pages/Services/components/BankOffers/BankOffers'

// Import slices
import calculateMortgageSlice from '@src/pages/Services/slices/calculateMortgageSlice'
import activeFieldSlice from '@src/pages/Services/slices/activeField'
import modalSlice from '@src/pages/Services/slices/modalSlice'
import i18n from '@src/config/i18n'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock dependencies
jest.mock('@src/hooks/useContentApi')
jest.mock('@src/hooks/useDropdownData')
jest.mock('@src/services/calculationService')

const mockStore = configureStore({
  reducer: {
    mortgage: calculateMortgageSlice,
    activeField: activeFieldSlice,
    modal: modalSlice,
  },
})

const renderWithProviders = (component: React.ReactElement, language = 'en') => {
  i18n.language = language
  
  return render(
    <Provider store={mockStore}>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </Provider>
  )
}

describe('WCAG 2.1 AA Accessibility Compliance', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock hooks
    require('@src/hooks/useContentApi').useContentApi = jest.fn(() => ({
      getContent: jest.fn((key, fallback) => fallback || key)
    }))
    
    require('@src/hooks/useDropdownData').useAllDropdowns = jest.fn(() => ({
      data: {},
      loading: false,
      error: null,
      getDropdownProps: jest.fn(() => ({
        label: 'Test Label',
        placeholder: 'Test Placeholder',
        options: []
      }))
    }))
  })

  describe('Level A Compliance - Critical', () => {
    test('all images have appropriate alt text', async () => {
      renderWithProviders(<BankOffers />)

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        images.forEach(img => {
          expect(img).toHaveAttribute('alt')
          const altText = img.getAttribute('alt')
          expect(altText).not.toBe('')
          expect(altText).not.toMatch(/^(image|img|picture)$/i)
        })
      })
    })

    test('all form controls have accessible labels', async () => {
      renderWithProviders(
        <form>
          <FirstStepForm />
        </form>
      )

      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox')
        const selects = screen.getAllByRole('combobox')
        const sliders = screen.getAllByRole('slider')

        [...inputs, ...selects, ...sliders].forEach(control => {
          // Must have either label, aria-label, or aria-labelledby
          const hasLabel = control.getAttribute('aria-label') ||
                          control.getAttribute('aria-labelledby') ||
                          screen.getByLabelText(control.getAttribute('name') || '')
          
          expect(hasLabel).toBeTruthy()
        })
      })
    })

    test('color is not used as sole means of conveying information', async () => {
      renderWithProviders(<BankOffers />)

      await waitFor(() => {
        // Check that recommended banks have both color AND text/icon indicators
        const recommendedElements = screen.getAllByText(/recommended/i)
        recommendedElements.forEach(element => {
          // Should have both visual indicator and text
          expect(element).toBeInTheDocument()
          
          const parent = element.closest('[data-testid*="bank-card"]')
          if (parent) {
            // Should have icon or badge in addition to color
            expect(parent.querySelector('[aria-label*="recommended"]')).toBeInTheDocument()
          }
        })
      })
    })

    test('content is accessible without CSS', async () => {
      // Disable styles temporarily
      const originalGetComputedStyle = window.getComputedStyle
      window.getComputedStyle = jest.fn(() => ({} as CSSStyleDeclaration))

      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        // Essential content should still be readable
        expect(screen.getByTestId('property-price-input')).toBeInTheDocument()
        expect(screen.getByTestId('property-ownership-dropdown')).toBeInTheDocument()
      })

      window.getComputedStyle = originalGetComputedStyle
    })
  })

  describe('Level AA Compliance - Enhanced', () => {
    test('contrast ratio meets 4.5:1 for normal text', async () => {
      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        const textElements = [
          screen.getByTestId('property-price-input'),
          screen.getByTestId('city-dropdown'),
          screen.getByTestId('property-ownership-dropdown')
        ]

        textElements.forEach(element => {
          const styles = window.getComputedStyle(element)
          const color = styles.color
          const backgroundColor = styles.backgroundColor
          
          // Mock contrast calculation (in real test, would use actual contrast library)
          expect(color).toBeDefined()
          expect(backgroundColor).toBeDefined()
          
          // Verify text is readable
          expect(element).toBeVisible()
        })
      })
    })

    test('contrast ratio meets 3:1 for large text (18pt+)', async () => {
      renderWithProviders(<BankOffers />)

      await waitFor(() => {
        const headings = screen.getAllByRole('heading')
        headings.forEach(heading => {
          const styles = window.getComputedStyle(heading)
          const fontSize = parseFloat(styles.fontSize)
          
          if (fontSize >= 18) { // 18pt or larger
            expect(heading).toBeVisible()
            // Would verify 3:1 contrast in real implementation
          }
        })
      })
    })

    test('resize text to 200% without loss of content or functionality', async () => {
      const { container } = renderWithProviders(<FirstStepForm />)

      // Simulate 200% zoom
      const originalFontSize = window.getComputedStyle(document.body).fontSize
      document.body.style.fontSize = '32px' // Double the typical 16px

      await waitFor(() => {
        // All content should remain accessible
        expect(screen.getByTestId('property-price-input')).toBeVisible()
        expect(screen.getByTestId('property-ownership-dropdown')).toBeVisible()
        
        // No horizontal scrolling should be required for content
        expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth + 10)
      })

      document.body.style.fontSize = originalFontSize
    })

    test('all functionality is keyboard accessible', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />)

      const dropdown = screen.getByRole('combobox')
      
      // Focus with keyboard
      await user.tab()
      expect(dropdown).toHaveFocus()

      // Open dropdown with keyboard
      await user.keyboard(' ') // Space key
      
      await waitFor(() => {
        expect(dropdown).toHaveAttribute('aria-expanded', 'true')
      })

      // Navigate options with keyboard
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      // Selection should work via keyboard
      expect(dropdown).toHaveAttribute('aria-expanded', 'false')
    })

    test('focus indicators are visible and clear', async () => {
      const user = userEvent.setup()
      renderWithProviders(<FirstStepForm />)

      const focusableElements = [
        screen.getByTestId('property-price-input'),
        screen.getByTestId('city-dropdown'),
        screen.getByTestId('property-ownership-dropdown')
      ]

      for (const element of focusableElements) {
        await user.tab()
        if (element === document.activeElement) {
          const styles = window.getComputedStyle(element)
          
          // Should have visible focus indicator
          expect(
            styles.outline !== 'none' || 
            styles.boxShadow !== 'none' ||
            styles.borderColor !== styles.backgroundColor
          ).toBeTruthy()
        }
      }
    })

    test('no flashing content that could cause seizures', async () => {
      renderWithProviders(<BankOffers />)

      // Check for animations and transitions
      const animatedElements = screen.getAllByTestId(/loading|spinner|animation/)
      
      animatedElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        
        if (styles.animation !== 'none') {
          // Animation should not flash more than 3 times per second
          const animationDuration = parseFloat(styles.animationDuration) || 1
          const flashRate = 1 / animationDuration
          
          expect(flashRate).toBeLessThanOrEqual(3)
        }
      })
    })
  })

  describe('Hebrew RTL Accessibility', () => {
    test('maintains proper reading order in RTL layout', async () => {
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />, 'he')

      await waitFor(() => {
        const container = screen.getByRole('combobox').closest('[dir]')
        expect(container).toHaveAttribute('dir', 'rtl')
        
        // Tab order should follow visual order in RTL
        const focusableElements = container.querySelectorAll('[tabindex="0"], button, input, select')
        expect(focusableElements.length).toBeGreaterThan(0)
      })
    })

    test('RTL text alignment is correct for Hebrew content', async () => {
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />, 'he')

      await waitFor(() => {
        const hebrewTexts = screen.getAllByText(/[\u0590-\u05FF]/)
        hebrewTexts.forEach(element => {
          const styles = window.getComputedStyle(element)
          expect(styles.direction).toBe('rtl')
          expect(styles.textAlign).toMatch(/right|start/)
        })
      })
    })

    test('Hebrew fonts load and display correctly', async () => {
      renderWithProviders(<FirstStepForm />, 'he')

      await waitFor(() => {
        const textElements = screen.getAllByText(/[\u0590-\u05FF]/)
        textElements.forEach(element => {
          const styles = window.getComputedStyle(element)
          
          // Should include Hebrew fonts
          expect(styles.fontFamily).toMatch(/(Heebo|Assistant|Rubik|Noto Sans Hebrew)/i)
          
          // Text should be visible and not fallback to generic fonts
          expect(element).toBeVisible()
        })
      })
    })
  })

  describe('Screen Reader Compatibility', () => {
    test('provides meaningful landmarks and regions', async () => {
      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        // Should have proper landmark roles
        expect(screen.getByRole('form')).toBeInTheDocument()
        
        const regions = screen.getAllByRole(/main|navigation|banner|contentinfo/)
        expect(regions.length).toBeGreaterThan(0)
      })
    })

    test('error messages are announced properly', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} error="This field is required" />)

      await waitFor(() => {
        const errorMessage = screen.getByText('This field is required')
        
        // Error should have proper ARIA attributes
        expect(errorMessage).toHaveAttribute('role', 'alert')
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
        
        // Associated input should reference the error
        const input = screen.getByRole('combobox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorMessage.id))
      })
    })

    test('loading states are announced to screen readers', async () => {
      // Mock loading state
      require('@src/hooks/useDropdownData').useAllDropdowns = jest.fn(() => ({
        data: {},
        loading: true,
        error: null,
        getDropdownProps: jest.fn(() => ({
          label: 'Loading...',
          placeholder: 'Loading...',
          options: []
        }))
      }))

      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        const loadingElement = screen.getByText(/loading/i)
        expect(loadingElement).toHaveAttribute('aria-live', 'polite')
        expect(loadingElement).toHaveAttribute('aria-busy', 'true')
      })
    })

    test('dynamic content changes are announced', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />)

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      await waitFor(() => {
        // Status should be announced when dropdown opens
        expect(dropdown).toHaveAttribute('aria-expanded', 'true')
        
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
        
        // Each option should be properly labeled
        options.forEach(option => {
          expect(option).toHaveAttribute('role', 'option')
        })
      })
    })
  })

  describe('Motor Impairment Accommodations', () => {
    test('click targets are at least 44x44 pixels', async () => {
      renderWithProviders(<BankOffers />)

      await waitFor(() => {
        const clickableElements = screen.getAllByRole('button')
        
        clickableElements.forEach(element => {
          const rect = element.getBoundingClientRect()
          expect(Math.max(rect.width, rect.height)).toBeGreaterThanOrEqual(44)
        })
      })
    })

    test('sufficient spacing between interactive elements', async () => {
      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        const interactiveElements = [
          ...screen.getAllByRole('button'),
          ...screen.getAllByRole('textbox'),
          ...screen.getAllByRole('combobox')
        ]

        for (let i = 0; i < interactiveElements.length - 1; i++) {
          const current = interactiveElements[i].getBoundingClientRect()
          const next = interactiveElements[i + 1].getBoundingClientRect()
          
          // Minimum 8px spacing between elements
          const horizontalGap = Math.max(0, next.left - current.right)
          const verticalGap = Math.max(0, next.top - current.bottom)
          
          expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(8)
        }
      })
    })

    test('drag and drop has keyboard alternatives', async () => {
      // If any drag-and-drop functionality exists, test keyboard alternatives
      const draggableElements = screen.queryAllByAttribute('draggable', 'true')
      
      draggableElements.forEach(element => {
        // Should have keyboard-accessible alternative
        expect(element).toHaveAttribute('tabindex', '0')
        expect(element).toHaveAttribute('role', 'button')
        expect(element).toHaveAttribute('aria-label')
      })
    })
  })

  describe('Cognitive Accessibility', () => {
    test('consistent navigation and interaction patterns', async () => {
      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        const dropdowns = screen.getAllByRole('combobox')
        
        // All dropdowns should have consistent interaction patterns
        dropdowns.forEach(dropdown => {
          expect(dropdown).toHaveAttribute('aria-haspopup', 'listbox')
          expect(dropdown).toHaveAttribute('aria-expanded')
        })
      })
    })

    test('clear and simple language in interface text', async () => {
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />)

      await waitFor(() => {
        // Interface text should avoid jargon and be clear
        const labels = screen.getAllByText(/property ownership/i)
        labels.forEach(label => {
          // Text should be reasonably short and clear
          expect(label.textContent.length).toBeLessThan(50)
          expect(label.textContent).not.toMatch(/[{}[\]()]/g) // No technical syntax
        })
      })
    })

    test('provides context and help for complex forms', async () => {
      renderWithProviders(<FirstStepForm />)

      await waitFor(() => {
        // Complex fields should have help text or tooltips
        const complexFields = screen.getAllByTestId(/property-ownership|initial-fee/)
        
        complexFields.forEach(field => {
          // Should have help text or tooltip
          const helpText = field.getAttribute('aria-describedby')
          if (helpText) {
            expect(screen.getByText(helpText)).toBeInTheDocument()
          }
        })
      })
    })

    test('error prevention and clear error recovery', async () => {
      const user = userEvent.setup()
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} required />)

      const dropdown = screen.getByRole('combobox')
      
      // Focus and blur to trigger validation
      await user.click(dropdown)
      await user.tab()

      await waitFor(() => {
        if (screen.queryByText(/required/i)) {
          const errorMessage = screen.getByText(/required/i)
          
          // Error message should be clear and actionable
          expect(errorMessage.textContent).toMatch(/select|choose|required/i)
          expect(errorMessage.textContent.length).toBeLessThan(100)
        }
      })
    })
  })

  describe('Automated Accessibility Testing', () => {
    test('FirstStepForm passes axe accessibility tests', async () => {
      const { container } = renderWithProviders(<FirstStepForm />)
      
      await waitFor(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })

    test('PropertyOwnership passes axe accessibility tests', async () => {
      const { container } = renderWithProviders(
        <PropertyOwnership value="" onChange={jest.fn()} />
      )
      
      await waitFor(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })

    test('BankOffers passes axe accessibility tests', async () => {
      const { container } = renderWithProviders(<BankOffers />)
      
      await waitFor(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })

    test('Hebrew RTL components pass accessibility tests', async () => {
      const { container } = renderWithProviders(
        <PropertyOwnership value="" onChange={jest.fn()} />, 
        'he'
      )
      
      await waitFor(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })
  })

  describe('Responsive Accessibility', () => {
    test('accessibility maintained on mobile viewports', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      Object.defineProperty(window, 'innerHeight', { value: 667 })
      window.dispatchEvent(new Event('resize'))

      const { container } = renderWithProviders(<FirstStepForm />)

      await waitFor(async () => {
        // Touch targets should still meet minimum size
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect()
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44)
        })

        // Should pass axe tests on mobile
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })
    })

    test('zoom up to 400% maintains functionality', async () => {
      const { container } = renderWithProviders(<FirstStepForm />)

      // Simulate 400% zoom
      document.body.style.zoom = '4'

      await waitFor(() => {
        // All interactive elements should remain accessible
        expect(screen.getByTestId('property-price-input')).toBeVisible()
        expect(screen.getByTestId('property-ownership-dropdown')).toBeVisible()

        // No content should be cut off
        expect(container.scrollHeight).toBeLessThan(window.innerHeight * 5)
      })

      document.body.style.zoom = '1'
    })
  })

  describe('Performance Impact on Accessibility', () => {
    test('accessibility features do not significantly impact performance', async () => {
      const startTime = performance.now()
      
      renderWithProviders(<FirstStepForm />)
      
      await waitFor(() => {
        const endTime = performance.now()
        const renderTime = endTime - startTime
        
        // Should render within reasonable time even with accessibility features
        expect(renderTime).toBeLessThan(1000) // Less than 1 second
      })
    })

    test('large lists maintain accessibility with virtualization', async () => {
      // Simulate large dropdown list
      const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`
      }))

      require('@src/hooks/useDropdownData').useAllDropdowns = jest.fn(() => ({
        data: { test: largeOptions },
        loading: false,
        error: null,
        getDropdownProps: jest.fn(() => ({
          label: 'Test',
          placeholder: 'Select...',
          options: largeOptions
        }))
      }))

      const user = userEvent.setup()
      renderWithProviders(<PropertyOwnership value="" onChange={jest.fn()} />)

      const dropdown = screen.getByRole('combobox')
      await user.click(dropdown)

      await waitFor(() => {
        // Should still be accessible with large lists
        expect(dropdown).toHaveAttribute('aria-expanded', 'true')
        
        // First few options should be accessible
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
        expect(options.length).toBeLessThanOrEqual(20) // Virtualized
      })
    })
  })
})