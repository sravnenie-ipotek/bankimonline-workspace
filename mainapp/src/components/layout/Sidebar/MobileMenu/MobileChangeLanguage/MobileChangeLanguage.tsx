import classNames from 'classnames/bind'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { CheckIcon } from '@assets/icons/CheckIcon'
import { IsraelFlagIcon } from '@assets/icons/IsraelFlagIcon'
import { RussiaFlagIcon } from '@assets/icons/RussiaFlagIcon'
import { USFlagIcon } from '@assets/icons/USFlagIcon'
import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { changeLanguage } from '@src/store/slices/languageSlice.ts'

import styles from './MobileChangeLanguage.module.scss'

const cx = classNames.bind(styles)

const MobileChangeLanguage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('ru')
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const language = useAppSelector((state) => state.language.language)
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

  useLayoutEffect(() => {
    if (language) {
      setSelectedLanguage(language)
    }
  }, [language])

  const data = [
    {
      value: 'ru',
      country: 'Россия',
      language: 'Русский',
      icon: <RussiaFlagIcon />,
    },
    {
      value: 'he',
      country: 'ישראל',
      language: 'עִברִית',
      icon: <IsraelFlagIcon />,
    },
    {
      value: 'en',
      country: 'United States',
      language: 'English',
      icon: <USFlagIcon />,
    },
  ]

  // изменение языка
  const handleLanguageChange = async (newLanguage: string) => {
    try {
      await i18n.changeLanguage(newLanguage)
      setSelectedLanguage(newLanguage)
      dispatch(changeLanguage(newLanguage))
    } catch (error) {
      console.error('Error changing language:', error)
    }
  }

  const selectedLanguageData = data.find(
    (item) => item.value === selectedLanguage
  )

  return (
    <div ref={wrapperRef} className={cx('lang')}>
      <div
        className={cx('wrapper')}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className={cx('languages')}>
          <div>{selectedLanguageData?.icon}</div>
          <div className={cx('language')}>
            <span className={cx('country')}>{t('country')}</span>
            <span className={cx('name')}>{selectedLanguageData?.country}</span>
          </div>
        </div>
        <CaretDownIcon
          className="cursor-pointer"
          onClick={() => setIsOpen(false)}
        />
      </div>
      <div
        className={cx('choose', {
          choose_open: isOpen,
        })}
      >
        <Header onClose={() => setIsOpen(false)} />
        <div className={cx('select')}>
          <div className={cx('placeholder')}>
            <span>{t('sel_cntr')}</span>
          </div>
          {data.map((item, index) => (
            <div
              key={index}
              tabIndex={0}
              className={cx('item')}
              onClick={() => {
                handleLanguageChange(item.value) // Изменение языка при выборе
                setIsOpen(false)
              }}
            >
              <div className={cx('languages')}>
                <div>{item?.icon}</div>
                <div className={cx('language')}>
                  <span className={cx('country')}>{item?.country}</span>
                  <span className={cx('name')}>{item?.language}</span>
                </div>
              </div>
              {selectedLanguage === item.value && <CheckIcon />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileChangeLanguage
