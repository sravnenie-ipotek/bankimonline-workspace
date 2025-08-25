/**
 * RTL (Right-to-Left) utilities for Hebrew language support
 */

/**
 * Detects if the current language requires RTL layout
 * @param language - The language code
 * @returns true if RTL is required
 */
export const isRTL = (language: string): boolean => {
  const rtlLanguages = ['he', 'ar', 'fa', 'ur']
  return rtlLanguages.includes(language)
}

/**
 * Gets the correct directional property based on RTL/LTR
 * @param isRtl - Whether RTL is active
 * @param ltrValue - The LTR value (e.g., 'left')
 * @param rtlValue - The RTL value (e.g., 'right')
 * @returns The correct directional value
 */
export const getDirectionalValue = (
  isRtl: boolean,
  ltrValue: string,
  rtlValue: string
): string => {
  return isRtl ? rtlValue : ltrValue
}

/**
 * Gets directional styles for CSS-in-JS
 * @param isRtl - Whether RTL is active
 * @returns Object with directional styles
 */
export const getDirectionalStyles = (isRtl: boolean) => ({
  start: isRtl ? 'right' : 'left',
  end: isRtl ? 'left' : 'right',
  marginStart: isRtl ? 'marginRight' : 'marginLeft',
  marginEnd: isRtl ? 'marginLeft' : 'marginRight',
  paddingStart: isRtl ? 'paddingRight' : 'paddingLeft',
  paddingEnd: isRtl ? 'paddingLeft' : 'paddingRight',
  borderStart: isRtl ? 'borderRight' : 'borderLeft',
  borderEnd: isRtl ? 'borderLeft' : 'borderRight',
  textAlign: isRtl ? 'right' as const : 'left' as const,
  direction: isRtl ? 'rtl' as const : 'ltr' as const
})

/**
 * CSS class names for RTL support
 */
export const rtlClasses = {
  rtl: 'rtl-layout',
  ltr: 'ltr-layout',
  start: 'direction-start',
  end: 'direction-end'
}

/**
 * Hook for RTL support in React components
 * Usage: const { isRtl, dir } = useRTL()
 */
export const useRTL = () => {
  if (typeof window === 'undefined') {
    return { isRtl: false, dir: 'ltr' as const }
  }
  
  const lang = document.documentElement.lang || 'en'
  const isRtl = isRTL(lang)
  
  return {
    isRtl,
    dir: isRtl ? 'rtl' as const : 'ltr' as const,
    ...getDirectionalStyles(isRtl)
  }
}

/**
 * Flips a value for RTL (e.g., transforms 'left' to 'right')
 * @param value - The value to flip
 * @returns The flipped value
 */
export const flipForRTL = (value: string): string => {
  const flipMap: Record<string, string> = {
    'left': 'right',
    'right': 'left',
    'margin-left': 'margin-right',
    'margin-right': 'margin-left',
    'padding-left': 'padding-right',
    'padding-right': 'padding-left',
    'border-left': 'border-right',
    'border-right': 'border-left',
    'float-left': 'float-right',
    'float-right': 'float-left',
    'text-left': 'text-right',
    'text-right': 'text-left'
  }
  
  return flipMap[value] || value
}

/**
 * Transform styles object for RTL
 * @param styles - The styles object
 * @param isRtl - Whether RTL is active
 * @returns Transformed styles
 */
export const transformStylesForRTL = (
  styles: Record<string, any>,
  isRtl: boolean
): Record<string, any> => {
  if (!isRtl) return styles
  
  const transformed: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(styles)) {
    switch (key) {
      case 'left':
        transformed.right = value
        break
      case 'right':
        transformed.left = value
        break
      case 'marginLeft':
        transformed.marginRight = value
        break
      case 'marginRight':
        transformed.marginLeft = value
        break
      case 'paddingLeft':
        transformed.paddingRight = value
        break
      case 'paddingRight':
        transformed.paddingLeft = value
        break
      case 'borderLeft':
        transformed.borderRight = value
        break
      case 'borderRight':
        transformed.borderLeft = value
        break
      case 'textAlign':
        if (value === 'left') transformed.textAlign = 'right'
        else if (value === 'right') transformed.textAlign = 'left'
        else transformed[key] = value
        break
      default:
        transformed[key] = value
    }
  }
  
  return transformed
}