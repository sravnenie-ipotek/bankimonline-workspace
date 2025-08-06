import classNames from 'classnames/bind'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { CheckIcon } from '@assets/icons/CheckIcon'
import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { setCurrency } from '@src/store/slices/currencySlice.ts'

import styles from './MobileCurrencySelector.module.scss'

const cx = classNames.bind(styles)

const MobileCurrencySelector = () => {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { t } = useTranslation()
  const currency = useAppSelector((state) => state.currency.currency)
  const dispatch = useAppDispatch()

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const currencyData = [
    {
      value: 'ILS',
      label: t('currency_ils', 'ILS (₪)'),
      symbol: '₪',
    },
    {
      value: 'USD',
      label: t('currency_usd', 'USD ($)'),
      symbol: '$',
    },
    {
      value: 'EUR',
      label: t('currency_eur', 'EUR (€)'),
      symbol: '€',
    },
  ]

  const selectedCurrencyData = currencyData.find((item) => item.value === currency) || currencyData[0]

  const handleCurrencyChange = (newCurrency: string) => {
    dispatch(setCurrency(newCurrency as 'ILS' | 'USD' | 'EUR'))
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className={cx('currency')}>
      <div
        className={cx('wrapper')}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className={cx('currencies')}>
          <div className={cx('symbol')}>
            {selectedCurrencyData?.symbol}
          </div>
          <div className={cx('currency-info')}>
            <span className={cx('label')}>{t('currency', 'Currency')}</span>
            <span className={cx('name')}>{selectedCurrencyData?.label}</span>
          </div>
        </div>
        <CaretDownIcon className="cursor-pointer" />
      </div>
      <div
        className={cx('choose', {
          choose_open: isOpen,
        })}
      >
        <Header onClose={() => setIsOpen(false)} />
        <div className={cx('select')}>
          <div className={cx('placeholder')}>
            <span>{t('select_currency', 'Select Currency')}</span>
          </div>
          {currencyData.map((item, index) => (
            <div
              key={index}
              tabIndex={0}
              className={cx('item')}
              onClick={() => handleCurrencyChange(item.value)}
            >
              <div className={cx('currencies')}>
                <div className={cx('symbol')}>
                  {item.symbol}
                </div>
                <div className={cx('currency-info')}>
                  <span className={cx('label')}>{item.value}</span>
                  <span className={cx('name')}>{item.label}</span>
                </div>
              </div>
              {currency === item.value && <CheckIcon />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileCurrencySelector 