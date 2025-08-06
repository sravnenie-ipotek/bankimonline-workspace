import classNames from 'classnames/bind'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/high-res.css'

import { Error } from '@components/ui/Error'

import { TitleElement } from '../TitleElement'
import styles from './PhoneInput.module.scss'

const cx = classNames.bind(styles)

interface CustomPhoneInputProps {
  icon?: string
  title?: string
  value: string | null
  handleChange: (phone: string) => void
  onBlur?: () => void
  error?: string | boolean
  tooltip?: string
  onlyCountries?: string[]
}
export function CustomPhoneInput({
  title,
  value,
  handleChange,
  error,
  onBlur,
  tooltip,
  onlyCountries = ['il', 'us', 'ru'],
}: CustomPhoneInputProps) {
  const id = useId()
  const { t, i18n } = useTranslation()

  return (
    <div className={cx('phone-wrapper')}>
      <TitleElement title={title} tooltip={tooltip} />
      <PhoneInput
        enableSearch
        inputProps={{ id }}
        containerClass={cx('phone-container')}
        buttonClass={cx('phone-button', { error: error })}
        inputClass={cx('phone-input', { error: error })}
        dropdownClass={cx(
          'phone-dropdown',
          'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
        )}
        searchClass={cx('phone-search')}
        searchPlaceholder={t('search')}
        searchNotFound={t('nothing_found')}
        disableSearchIcon
        country={'il'}
        onlyCountries={onlyCountries}
        value={value}
        onBlur={onBlur}
        onChange={(phone) => handleChange(phone)}
      />
      {error && <Error error={error} />}
    </div>
  )
}
