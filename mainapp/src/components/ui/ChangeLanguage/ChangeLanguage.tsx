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
import { CaretUpIcon } from '@assets/icons/CaretUpIcon'
import { CheckIcon } from '@assets/icons/CheckIcon'
import { IsraelFlagIcon } from '@assets/icons/IsraelFlagIcon'
import { RussiaFlagIcon } from '@assets/icons/RussiaFlagIcon'
import { USFlagIcon } from '@assets/icons/USFlagIcon'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { changeLanguage } from '@src/store/slices/languageSlice'

import Divider from '../Divider/Divider'
import styles from './changeLanguage.module.scss'

const cx = classNames.bind(styles)
const ChangeLanguage = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('ru')

  const wrapperRef = useRef<HTMLDivElement>(null)

  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const language = useAppSelector((state) => state.language.language)

  useLayoutEffect(() => {
    if (language) {
      setSelectedLanguage(language)
    }
  }, [language])

  const dispatch = useAppDispatch()

  // закрывает меню при нажатии за пределами
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
    <>
      <div ref={wrapperRef} className={cx('language')}>
        <div
          className={cx('language-wrapper')}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <div className={cx('language-input')}>
            <div>{selectedLanguageData?.icon}</div>
            <div className={cx('language-input__text')}>
              <span className={cx('language-input__text-country')}>
                {t('country')}
              </span>
              <span className={cx('language-input__text-name')}>
                {selectedLanguageData?.country}
              </span>
            </div>
          </div>
          {isOpen ? (
            <CaretUpIcon
              className="cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
          ) : (
            <CaretDownIcon
              className="cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          )}
        </div>
        {isOpen && (
          <div
            className={cx(
              'language-select',
              'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
            )}
          >
            <div className={cx('language-select__title')}>
              <span>{t('sel_cntr')}</span>
            </div>
            <Divider />
            {data.map((item, index) => (
              <div
                key={index}
                tabIndex={0}
                className={cx('language-select__item')}
                onClick={() => {
                  handleLanguageChange(item.value) // Изменение языка при выборе
                  setIsOpen(false)
                }}
              >
                <div className={cx('language-select__wrapper')}>
                  <div>{item?.icon}</div>
                  <div className={cx('language-select__text')}>
                    <span className={cx('language-select__text-name')}>
                      {item?.country}
                    </span>
                    <span className={cx('language-select__text-lang')}>
                      {item?.language}
                    </span>
                  </div>
                </div>
                {selectedLanguage === item.value && <CheckIcon />}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ChangeLanguage
