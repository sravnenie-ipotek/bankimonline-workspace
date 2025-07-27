import classNames from 'classnames/bind'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { setFilter } from '@src/pages/Services/slices/filterSlice.ts'

import styles from './filter.module.scss'

const cx = classNames.bind(styles)

const Filter = () => {
  const { getContent } = useContentApi('mortgage_step4')
  const filter = useAppSelector((state) => state.filter.mortgageType)
  const dispatch = useAppDispatch()

  // Mortgage type filter options following translation rules
  const filterOptions = [
    { 
      value: 'all', 
      label: getContent('mortgage_filter_option_1', 'All Mortgage Programs') 
    },
    { 
      value: 'prime', 
      label: getContent('mortgage_filter_option_2', 'Prime Rate Mortgages') 
    },
    { 
      value: 'fixed_inflation', 
      label: getContent('mortgage_filter_option_3', 'Fixed Rate Mortgages') 
    },
    { 
      value: 'variable_inflation', 
      label: getContent('mortgage_filter_option_4', 'Variable Rate Mortgages') 
    }
  ]

  return (
    <Column>
      <DropdownMenu
        data={filterOptions}
        title={getContent('mortgage_filter_title', 'Mortgage Type')}
        placeholder={getContent('mortgage_filter_placeholder', 'Select mortgage type')}
        value={filter || 'all'}
        onChange={(value) => dispatch(setFilter(value))}
        className={cx('dropdown')}
        style={{ background: 'transparent !important' }}
      />
    </Column>
  )
}

export default Filter
