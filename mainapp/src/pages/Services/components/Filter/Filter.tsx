import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'
import { useDropdownData } from '@src/hooks/useDropdownData'
import { useLocation } from 'react-router-dom'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { Error } from '@components/ui/Error'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { setFilter } from '@src/pages/Services/slices/filterSlice.ts'

import styles from './filter.module.scss'

interface FilterProps {
  screenLocation?: string
}

const cx = classNames.bind(styles)
const Filter = ({ screenLocation: propScreenLocation }: FilterProps = {}) => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const filter = useAppSelector((state) => state.filter)
  const dispatch = useAppDispatch()

  // Use prop if provided, otherwise determine from route (with safe fallback)
  const getScreenLocation = () => {
    if (propScreenLocation) {
      return propScreenLocation
    }
    
    const path = location.pathname
    // Only change for refinance-credit to fix the immediate issue
    // Keep other services using the original 'mortgage_step4' to avoid breaking them
    if (path.includes('refinance-credit')) {
      return 'mortgage_step4' // Use mortgage_step4 but with different content
    } else {
      return 'mortgage_step4' // Safe default that we know works
    }
  }

  const screenLocation = getScreenLocation()
  const { getContent } = useContentApi(screenLocation)

  // Phase 4: Use database-driven dropdown data instead of hardcoded array
  const dropdownData = useDropdownData(screenLocation, 'filter', 'full')

  // Phase 4: Handle loading and error states
  if (dropdownData.loading) {
    }

  if (dropdownData.error) {
    console.warn('❌ Filter dropdown error:', dropdownData.error)
  }

  // Map the current filter state to the dropdown value
  const getCurrentValue = () => {
    switch (filter.mortgageType) {
      case 'all':
        return 'filter_1'
      case 'prime':
        return 'filter_2'
      case 'fixed':
        return 'filter_3'
      case 'variable':
        return 'filter_4'
      default:
        return 'filter_1'
    }
  }

  // Check if we're on refinance-credit page to customize display only
  const isRefinanceCredit = location.pathname.includes('refinance-credit')
  
  // Get appropriate fallback data - only customize for refinance-credit
  const getFallbackData = () => {
    if (isRefinanceCredit) {
      // For refinance-credit specifically, show credit-appropriate labels
      // but keep same filter values to maintain state compatibility
      return [
        { value: 'filter_1', label: getContent('calculate_mortgage_filter_1', 'כל הצעות האשראי') },
        { value: 'filter_2', label: getContent('calculate_mortgage_filter_2', 'הצעות בריבית מועדפת') },
        { value: 'filter_3', label: getContent('calculate_mortgage_filter_3', 'הצעות בריבית קבועה') },
        { value: 'filter_4', label: getContent('calculate_mortgage_filter_4', 'הצעות בריבית משתנה') },
      ]
    } else {
      // For all other services, use original mortgage labels
      return [
        { value: 'filter_1', label: getContent('calculate_mortgage_filter_1', 'כל תוכניות המשכנתא') },
        { value: 'filter_2', label: getContent('calculate_mortgage_filter_2', 'משכנתאות בריבית פריים') },
        { value: 'filter_3', label: getContent('calculate_mortgage_filter_3', 'משכנתאות בריבית קבועה') },
        { value: 'filter_4', label: getContent('calculate_mortgage_filter_4', 'משכנתאות בריבית משתנה') },
      ]
    }
  }

  // Use database options or fallback to customized options
  const data = dropdownData.options.length > 0 ? dropdownData.options : getFallbackData()

  // Get appropriate title and placeholder - only customize for refinance-credit
  const getDropdownLabels = () => {
    if (isRefinanceCredit) {
      return {
        title: getContent('calculate_mortgage_filter_title', 'סנן הצעות אשראי'),
        placeholder: getContent('calculate_mortgage_filter_title', 'סנן הצעות אשראי')
      }
    } else {
      return {
        title: getContent('calculate_mortgage_filter_title', 'סנן לפי סוג משכנתא'),
        placeholder: getContent('calculate_mortgage_filter_title', 'סנן לפי סוג משכנתא')
      }
    }
  }

  const labels = getDropdownLabels()

  return (
    <Column>
      <DropdownMenu
        data={data}
        title={dropdownData.label || labels.title}
        placeholder={dropdownData.placeholder || labels.placeholder}
        value={getCurrentValue()}
        onChange={(value) => dispatch(setFilter(value))}
        className={cx('dropdown')}
        style={{ background: 'transparent !important' }}
        disabled={dropdownData.loading}
      />
      {dropdownData.error && (
        <Error error={getContent('error_dropdown_load_failed', 'Failed to load filter options. Please refresh the page.')} />
      )}
    </Column>
  )
}

export default Filter
