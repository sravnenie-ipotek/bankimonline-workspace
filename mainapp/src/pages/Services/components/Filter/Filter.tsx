import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { setFilter } from '@src/pages/Services/slices/filterSlice.ts'

import styles from './filter.module.scss'

const cx = classNames.bind(styles)
const Filter = () => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const filter = useAppSelector((state) => state.filter)
  const dispatch = useAppDispatch()

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

  const data = [
    { value: 'filter_1', label: getContent('calculate_mortgage_filter_1', 'כל תוכניות המשכנתא') },
    { value: 'filter_2', label: getContent('calculate_mortgage_filter_2', 'משכנתאות בריבית פריים') },
    { value: 'filter_3', label: getContent('calculate_mortgage_filter_3', 'משכנתאות בריבית קבועה') },
    { value: 'filter_4', label: getContent('calculate_mortgage_filter_4', 'משכנתאות בריבית משתנה') },
  ]

  return (
    <Column>
      <DropdownMenu
        data={data}
        title={getContent('calculate_mortgage_filter_title', 'סנן לפי סוג משכנתא')}
        placeholder={getContent('calculate_mortgage_filter_title', 'סנן לפי סוג משכנתא')}
        value={getCurrentValue()}
        onChange={(value) => dispatch(setFilter(value))}
        className={cx('dropdown')}
        style={{ background: 'transparent !important' }}
      />
    </Column>
  )
}

export default Filter
