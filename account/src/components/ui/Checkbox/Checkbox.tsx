import classNames from 'classnames/bind'
import React from 'react'

import styles from './checkbox.module.scss'

const cx = classNames.bind(styles)

type CheckboxProps = {
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  name: string
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, name }) => {
  return (
    <>
      <input
        type="checkbox"
        checked={checked}
        className={cx(styles.checkboxOther)}
        onChange={onChange}
        name={name}
        id={name}
      />
      <label htmlFor={name}></label>
    </>
  )
}

export default Checkbox
