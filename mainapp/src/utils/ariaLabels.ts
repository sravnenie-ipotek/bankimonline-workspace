/**
 * ARIA labels and accessibility utilities (Bug #20)
 * Provides consistent ARIA labels for improved accessibility
 */

import { useTranslation } from 'react-i18next'

/**
 * Get ARIA label for form fields
 */
export const getFieldAriaLabel = (
  fieldName: string,
  fieldType: string,
  required: boolean = false,
  error?: string
): Record<string, string> => {
  const ariaProps: Record<string, string> = {
    'aria-label': fieldName,
    'aria-required': required.toString(),
  }
  
  if (error) {
    ariaProps['aria-invalid'] = 'true'
    ariaProps['aria-describedby'] = `${fieldName}-error`
  }
  
  // Add specific labels for different field types
  switch (fieldType) {
    case 'currency':
      ariaProps['aria-label'] = `${fieldName} in shekels`
      break
    case 'percentage':
      ariaProps['aria-label'] = `${fieldName} percentage`
      break
    case 'date':
      ariaProps['aria-label'] = `${fieldName} date picker`
      break
    case 'phone':
      ariaProps['aria-label'] = `${fieldName} phone number`
      break
    case 'email':
      ariaProps['aria-label'] = `${fieldName} email address`
      break
  }
  
  return ariaProps
}

/**
 * Get ARIA labels for buttons
 */
export const getButtonAriaLabel = (
  action: string,
  context?: string,
  loading?: boolean
): Record<string, string> => {
  const ariaProps: Record<string, string> = {
    'aria-label': context ? `${action} ${context}` : action,
  }
  
  if (loading) {
    ariaProps['aria-busy'] = 'true'
    ariaProps['aria-label'] = `${ariaProps['aria-label']} loading`
  }
  
  return ariaProps
}

/**
 * Get ARIA labels for navigation
 */
export const getNavAriaLabel = (
  currentStep: number,
  totalSteps: number,
  stepName?: string
): Record<string, string> => {
  return {
    'aria-label': stepName || `Step ${currentStep}`,
    'aria-current': 'step',
    'aria-setsize': totalSteps.toString(),
    'aria-posinset': currentStep.toString(),
  }
}

/**
 * Get ARIA labels for sliders
 */
export const getSliderAriaLabel = (
  name: string,
  min: number,
  max: number,
  value: number,
  unit?: string
): Record<string, string> => {
  const unitLabel = unit ? ` ${unit}` : ''
  
  return {
    'aria-label': name,
    'aria-valuemin': min.toString(),
    'aria-valuemax': max.toString(),
    'aria-valuenow': value.toString(),
    'aria-valuetext': `${value}${unitLabel}`,
  }
}

/**
 * Get ARIA labels for alerts and errors
 */
export const getAlertAriaLabel = (
  severity: 'error' | 'warning' | 'info' | 'success',
  message: string
): Record<string, string> => {
  return {
    'role': 'alert',
    'aria-live': severity === 'error' ? 'assertive' : 'polite',
    'aria-atomic': 'true',
    'aria-label': `${severity}: ${message}`,
  }
}

/**
 * Hook for multilingual ARIA labels
 */
export const useAriaLabels = () => {
  const { t, i18n } = useTranslation()
  
  const getLocalizedFieldLabel = (fieldKey: string, required: boolean = false): string => {
    const baseLabel = t(`aria.field.${fieldKey}`, fieldKey)
    return required ? t('aria.required_field', { field: baseLabel }) : baseLabel
  }
  
  const getLocalizedButtonLabel = (actionKey: string, loading: boolean = false): string => {
    const baseLabel = t(`aria.button.${actionKey}`, actionKey)
    return loading ? t('aria.loading', { action: baseLabel }) : baseLabel
  }
  
  const getLocalizedStepLabel = (step: number, total: number): string => {
    return t('aria.step_progress', { current: step, total })
  }
  
  const getLocalizedErrorLabel = (errorKey: string): string => {
    return t(`aria.error.${errorKey}`, errorKey)
  }
  
  return {
    getLocalizedFieldLabel,
    getLocalizedButtonLabel,
    getLocalizedStepLabel,
    getLocalizedErrorLabel,
    isRTL: i18n.dir() === 'rtl',
  }
}

/**
 * Common ARIA patterns for the mortgage calculator
 */
export const MORTGAGE_ARIA_LABELS = {
  propertyValue: {
    'aria-label': 'Property value in shekels',
    'aria-required': 'true',
    'role': 'spinbutton',
  },
  initialPayment: {
    'aria-label': 'Initial down payment amount',
    'aria-required': 'true',
    'role': 'slider',
  },
  loanPeriod: {
    'aria-label': 'Loan period in years',
    'aria-required': 'true',
    'role': 'spinbutton',
    'aria-valuemin': '4',
    'aria-valuemax': '30',
  },
  monthlyPayment: {
    'aria-label': 'Desired monthly payment in shekels',
    'aria-required': 'true',
    'role': 'spinbutton',
  },
  propertyOwnership: {
    'aria-label': 'Property ownership status',
    'aria-required': 'true',
    'role': 'combobox',
    'aria-expanded': 'false',
  },
  citySelection: {
    'aria-label': 'Select city where you are buying property',
    'aria-required': 'true',
    'role': 'combobox',
    'aria-autocomplete': 'list',
  },
  nextButton: {
    'aria-label': 'Continue to next step',
    'role': 'button',
  },
  previousButton: {
    'aria-label': 'Go back to previous step',
    'role': 'button',
  },
  calculateButton: {
    'aria-label': 'Calculate mortgage options',
    'role': 'button',
  },
} as const