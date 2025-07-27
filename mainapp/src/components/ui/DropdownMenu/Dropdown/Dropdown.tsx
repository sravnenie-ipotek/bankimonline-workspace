import classNames from 'classnames/bind'
import React from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { CaretUpIcon } from '@assets/icons/CaretUpIcon'
import { CheckIcon } from '@assets/icons/CheckIcon'
import { MagnifyingGlassIcon } from '@assets/icons/magnifyingGlassIcon'
import { Error } from '@components/ui/Error'

import styles from './dropdown.module.scss'

const cx = classNames.bind(styles)

interface DropdownValue {
  value: string
  label: string
}

interface DropdownProps
  extends Omit<React.HTMLProps<HTMLDivElement>, 'data' | 'value' | 'onChange'> {
  data: Array<DropdownValue>
  title?: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  searchable?: boolean
  searchPlaceholder?: string
  nothingFoundText?: string
  error?: boolean | string
  className?: string
  dataTestId?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  data,
  placeholder,
  onChange,
  value,
  searchable,
  searchPlaceholder,
  nothingFoundText,
  onBlur,
  error,
  className,
  dataTestId,
  ...props
}) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  /**
   * Функция которая обрабатывает клик вне компонента
   * 1. закрывает dropdown если кликнули вне компонента
   */

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  const handleSelectItem = (item: { value: string; label: string }) => {
    onChange?.(item.value)
    setIsOpen(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const filteredOptions = data.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div
        ref={wrapperRef}
        onBlur={onBlur as () => void}
        className={cx(
          'dropdown',
          `${isOpen && 'focus'}`,
          `${error && !isOpen && 'error'}`,
          className
        )}
        data-testid={dataTestId}
        {...props}
      >
        <div
          className={cx('dropdown-wrapper')}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <input
            readOnly
            className={cx('dropdown-input', 'truncate', className)}
            id={id}
            placeholder={placeholder}
            value={data.find((item) => item.value === value)?.label || ''}
          />
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
              'dropdown-select',
              'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
            )}
          >
            {searchable && (
              <div className={cx('dropdown-select__search')}>
                <div className={cx('dropdown-select__search-wrapper')}>
                  <MagnifyingGlassIcon />
                  <input
                    tabIndex={0}
                    className={cx('dropdown-select__search-input')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    autoComplete="off"
                  />
                </div>
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => (
                <div
                  key={index}
                  tabIndex={0}
                  className={cx('dropdown-select__item')}
                  onClick={() => handleSelectItem(item)}
                  data-testid={`${dataTestId}-item-${item.value}`}
                >
                  {item.label}
                  {value === item.value && <CheckIcon />}
                </div>
              ))
            ) : (
              <p className={cx('dropdown-select__search-no-result')}>
                {nothingFoundText}
              </p>
            )}
          </div>
        )}
      </div>
      {error && !isOpen && <Error error={error} />}
    </>
  )
}

export default Dropdown
