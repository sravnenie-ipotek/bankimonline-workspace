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

  const data = [
    { value: 'filter_1', label: getContent('calculate_mortgage_filter_1', 'calculate_mortgage_filter_1') },
    { value: 'filter_2', label: getContent('calculate_mortgage_filter_2', 'calculate_mortgage_filter_2') },
    { value: 'filter_3', label: getContent('calculate_mortgage_filter_3', 'calculate_mortgage_filter_3') },
    { value: 'filter_4', label: getContent('calculate_mortgage_filter_4', 'calculate_mortgage_filter_4') },
  ]

  return (
    <Column>
      <DropdownMenu
        data={data}
        title={getContent('calculate_mortgage_filter_title', 'calculate_mortgage_filter_title')}
        placeholder={getContent('calculate_mortgage_filter_title', 'calculate_mortgage_filter_title')}
        value={filter}
        onChange={(value) => dispatch(setFilter(value))}
        className={cx('dropdown')}
        style={{ background: 'transparent !important' }}
      />
    </Column>
  )
}

export default Filter
