/**
 * Form focus management utilities (Bug #16)
 * Automatically focuses on fields with errors
 */

import { useEffect, useRef } from 'react'

/**
 * Focus on the first field with an error
 * @param errors - Object containing field errors
 * @param touched - Object containing touched fields
 */
export const focusFirstError = (
  errors: Record<string, any>,
  touched: Record<string, any>
): void => {
  // Get all error fields that have been touched
  const errorFields = Object.keys(errors).filter(field => touched[field])
  
  if (errorFields.length === 0) return
  
  // Find the first error field in DOM order
  const firstErrorField = errorFields[0]
  
  // Try multiple strategies to find the element
  const strategies = [
    () => document.querySelector(`[name="${firstErrorField}"]`),
    () => document.querySelector(`[id="${firstErrorField}"]`),
    () => document.querySelector(`[data-field="${firstErrorField}"]`),
    () => document.querySelector(`[data-testid="${firstErrorField}-input"]`),
    () => document.getElementById(firstErrorField),
  ]
  
  for (const strategy of strategies) {
    const element = strategy() as HTMLElement
    if (element) {
      // Scroll to element
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      
      // Focus after scroll
      setTimeout(() => {
        element.focus()
        
        // Add visual indication
        element.classList.add('field-error-focus')
        setTimeout(() => {
          element.classList.remove('field-error-focus')
        }, 3000)
      }, 500)
      
      break
    }
  }
}

/**
 * Hook to auto-focus on form errors
 */
export const useErrorFocus = (
  errors: Record<string, any>,
  touched: Record<string, any>,
  isSubmitting: boolean
) => {
  const previousErrorsRef = useRef<string>('')
  
  useEffect(() => {
    // Only focus on new errors, not on every render
    const currentErrors = JSON.stringify(Object.keys(errors))
    
    if (
      currentErrors !== previousErrorsRef.current &&
      Object.keys(errors).length > 0 &&
      !isSubmitting
    ) {
      focusFirstError(errors, touched)
      previousErrorsRef.current = currentErrors
    }
  }, [errors, touched, isSubmitting])
}

/**
 * Trap focus within a modal or form section
 */
export const trapFocus = (containerElement: HTMLElement): (() => void) => {
  const focusableElements = containerElement.querySelectorAll<HTMLElement>(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  )
  
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  }
  
  containerElement.addEventListener('keydown', handleKeyDown)
  
  // Focus first element
  firstFocusable?.focus()
  
  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Manage focus for multi-step forms
 */
export class FormFocusManager {
  private currentStep: number = 1
  private stepElements: Map<number, HTMLElement> = new Map()
  
  setStep(step: number, element: HTMLElement): void {
    this.stepElements.set(step, element)
  }
  
  focusStep(step: number): void {
    const element = this.stepElements.get(step)
    if (element) {
      // Find first focusable element in step
      const firstInput = element.querySelector<HTMLElement>(
        'input:not([type="hidden"]), select, textarea'
      )
      
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus()
        }, 100)
      }
    }
    this.currentStep = step
  }
  
  focusNext(): void {
    this.focusStep(this.currentStep + 1)
  }
  
  focusPrevious(): void {
    this.focusStep(this.currentStep - 1)
  }
  
  reset(): void {
    this.currentStep = 1
    this.stepElements.clear()
  }
}

/**
 * Hook for multi-step form focus management
 */
export const useStepFocus = (currentStep: number) => {
  const managerRef = useRef(new FormFocusManager())
  const stepRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (stepRef.current) {
      managerRef.current.setStep(currentStep, stepRef.current)
      managerRef.current.focusStep(currentStep)
    }
  }, [currentStep])
  
  return {
    stepRef,
    focusNext: () => managerRef.current.focusNext(),
    focusPrevious: () => managerRef.current.focusPrevious(),
    reset: () => managerRef.current.reset(),
  }
}

/**
 * CSS for error focus indication
 * Add this to your global styles
 */
export const ERROR_FOCUS_STYLES = `
  .field-error-focus {
    outline: 2px solid #ff6b6b !important;
    outline-offset: 2px;
    animation: error-pulse 1s ease-in-out;
  }
  
  @keyframes error-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
    }
  }
`