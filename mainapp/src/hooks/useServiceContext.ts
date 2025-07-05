import { useLocation } from 'react-router-dom'

export type ServiceType = 'mortgage' | 'credit' | 'refinance-mortgage' | 'refinance-credit'

export const useServiceContext = (): ServiceType | null => {
  const location = useLocation()
  
  if (location.pathname.includes('/calculate-mortgage')) {
    return 'mortgage'
  }
  
  if (location.pathname.includes('/calculate-credit')) {
    return 'credit'
  }
  
  if (location.pathname.includes('/refinance-mortgage')) {
    return 'refinance-mortgage'
  }
  
  if (location.pathname.includes('/refinance-credit')) {
    return 'refinance-credit'
  }
  
  return null
}