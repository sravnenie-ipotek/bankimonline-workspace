import classNames from 'classnames/bind'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Error } from '@components/ui/Error'

import { CancelIcon } from '../../../assets/icons/CancelIcon'
import { CaretDownIcon } from '../../../assets/icons/CaretDownIcon'
import { CaretUpIcon } from '../../../assets/icons/CaretUpIcon'
import { MagnifyingGlassIcon } from '../../../assets/icons/magnifyingGlassIcon'
import styles from './multiselect.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  data: string[]
  placeholder: string
  fieldName?: string
  value?: string[]
  error?: string | boolean | string[]
  onChange?: (value: string[]) => void
  onBlur?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  searchDescription?: string
  nothingFoundText?: string
}

const MultiSelect: React.FC<TypeProps> = ({
  data,
  placeholder,
  onChange,
  value,
  searchable,
  searchPlaceholder,
  nothingFoundText,
  searchDescription,
  onBlur,
  error,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [checkItem, setCheckItem] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setCheckItem(value || [])
    }
  }, [isOpen, value])

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  const handleSelectItem = (item: string) => {
    setCheckItem((prevCheckItems) => {
      if (prevCheckItems.includes(item)) {
        return prevCheckItems.filter((existingItem) => existingItem !== item)
      } else {
        return [...prevCheckItems, item]
      }
    })
  }

  const handleRemoveItem = (itemToRemove: string, event: React.MouseEvent) => {
    const updatedValue = value?.filter((item) => item !== itemToRemove) || []
    onChange?.(updatedValue)

    setCheckItem((prevCheckItems) => {
      return prevCheckItems.filter((item) => item !== itemToRemove)
    })
    event.stopPropagation()
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const filteredOptions = Array.isArray(data)
    ? data.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <>
      <div
        ref={wrapperRef}
        onBlur={onBlur as () => void}
        className={cx(
          'multiselect',
          `${isOpen && 'focus'}`,
          `${error && !isOpen && 'error'}`
        )}
      >
        <div
          className={cx('multiselect-wrapper')}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <div className={cx('multiselect-input', 'truncate')}>
            {value && value.length > 0 ? (
              value.map((item) => (
                <div className={cx('multiselect-input__item')} key={item}>
                  {item}
                  <CancelIcon
                    onClick={(event) => handleRemoveItem(item, event)}
                  />
                </div>
              ))
            ) : (
              <span className={cx('multiselect-placeholder')}>
                {placeholder}
              </span>
            )}
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
          <div className={cx('multiselect-select')}>
            <div
              className={cx(
                'multiselect-scroll',
                'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
              )}
            >
              {searchable && (
                <div className={cx('multiselect-select__search')}>
                  <div className={cx('multiselect-select__search-wrapper')}>
                    <MagnifyingGlassIcon />
                    <input
                      tabIndex={0}
                      className={cx('multiselect-select__search-input')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={searchPlaceholder}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}
              <div className={cx('multiselect-select__subtitle')}>
                {searchDescription}
              </div>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item, index) => (
                  <div
                    key={index}
                    tabIndex={0}
                    className={cx('multiselect-select__item')}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className={cx('multiselect-select__item-title')}>
                      <input
                        type="checkbox"
                        id={item}
                        className={cx('checkbox')}
                        checked={checkItem.includes(item)}
                        onChange={() => handleSelectItem(item)}
                      />
                      <label htmlFor={item}>{item}</label>
                    </div>
                  </div>
                ))
              ) : (
                <p className={cx('multiselect-select__search-no-result')}>
                  {nothingFoundText}
                </p>
              )}
            </div>
            <div className={cx('multiselect-select__button')}>
              <button
                type="button"
                className={cx('multiselect-select__button-item')}
                onClick={() => {
                  onChange?.(checkItem)
                  setIsOpen(false)
                }}
              >
                {t('apply')}
              </button>
            </div>
          </div>
        )}
      </div>
      {error && !isOpen && <Error error={error as string} />}
    </>
  )
}

export default MultiSelect
