import classNames from 'classnames/bind'
import React from 'react'

import styles from './radioButton.module.scss'

type CustomRadioButtonProps = {
  label?: string
  name?: string
  value?: string
  checked: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const cx = classNames.bind(styles)

const RadioButton: React.FC<CustomRadioButtonProps> = ({
  checked,
  name,
  value,
  label,
  onChange,
}) => {
  return (
    <label className={cx(styles.container)}>
      {label}
      <input
        type="radio"
        checked={checked}
        name={name}
        value={value}
        onChange={onChange}
      />
      <span className={cx(styles.checkmark)}></span>
    </label>
  )
}

export default RadioButton
