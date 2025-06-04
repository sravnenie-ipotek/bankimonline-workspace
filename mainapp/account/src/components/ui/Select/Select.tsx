import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'

import { Caret } from '@assets/icons'

import styles from './select.module.scss'

const cx = classNames.bind(styles)

interface SelectProps {
  selectPoints: { name: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

const Select: React.FC<SelectProps> = ({ selectPoints, value, onChange }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const handleSelectOption = (option: string) => {
    onChange(option)
    setDropdownVisible(false)
  }

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible)
  }

  useEffect(() => {
    const isValidValue = selectPoints.some((point) => point.value === value)
    if (!isValidValue && selectPoints.length > 0) {
      onChange(selectPoints[0].value)
    }
  }, [selectPoints, value, onChange])

  return (
    <div className={cx(styles.customDropdown)}>
      <div className={cx(styles.selectedOption)} onClick={toggleDropdown}>
        {value && (
          <>
            <p>{selectPoints.find((point) => point.value === value)?.name}</p>
            <div
              className={cx(
                dropdownVisible ? '-rotate-90' : 'rotate-90',
                'transition-transform duration-300 ease-in-out'
              )}
            >
              <Caret color="white" />
            </div>
          </>
        )}
      </div>
      {dropdownVisible && (
        <ul className={cx(styles.dropdownList)}>
          {selectPoints.map((point, index) => (
            <li key={index} onClick={() => handleSelectOption(point.value)}>
              {point.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Select
