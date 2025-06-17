import classNames from 'classnames/bind'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './dropdownCalendar.module.scss'

const cx = classNames.bind(styles)

interface TypeProps {
  data: string[] | number[]
  onChange?: (value: string | number) => void
  value?: string | number
}

const DropdownCalendar: React.FC<TypeProps> = ({ data, onChange, value }) => {
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
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

  const handleSelectItem = (item: string | number) => {
    onChange?.(item)
    setIsOpen(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  return (
    <>
      <div
        ref={wrapperRef}
        className={cx('dropdown')}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <div className={cx('dropdown-wrapper')}>
          <input
            readOnly
            className={cx('dropdown-input', 'truncate')}
            id={id}
            value={value}
          />
          {isOpen ? (
            <CaretRightIcon
              size={16}
              color="#fff"
              onClick={() => setIsOpen(false)}
              style={{ transform: 'rotate(90deg)' }}
            />
          ) : (
            <CaretRightIcon
              size={16}
              color="#fff"
              onClick={() => setIsOpen(false)}
              style={{ transform: 'rotate(-90deg)' }}
            />
          )}
        </div>
        {isOpen && (
          <div
            className={cx(
              'dropdown-select',
              'scrollbar scrollbar-thumb-base-primaryDisabledButton scrollbar-thumb-rounded-md scrollbar-w-1'
            )}
          >
            {data.map((item, index) => (
              <div
                key={index}
                tabIndex={0}
                className={cx('dropdown-select__item', {
                  selected: value === item,
                })}
                onClick={() => handleSelectItem(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
export default DropdownCalendar
