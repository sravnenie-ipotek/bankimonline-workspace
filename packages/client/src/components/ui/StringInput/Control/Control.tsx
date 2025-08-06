import classNames from 'classnames/bind'
import { ChangeEvent } from 'react'

import styles from './control.module.scss'

const cx = classNames.bind(styles)
// Компонент для ввода строк

interface StringInputProps
  extends Omit<
    React.HTMLProps<HTMLInputElement>,
    'value' | 'onChange' | 'onBlur'
  > {
  placeholder: string
  onChange: (value: string) => void
  onBlur?: () => void
  value: string
  error?: string | boolean
  name?: string
}
const StringInput: React.FC<StringInputProps> = ({
  placeholder,
  onChange,
  value,
  error,
  onBlur,
  name,
  ...props
}: StringInputProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <>
      <input
        className={cx('string-input', `${error && 'error'}`)}
        type="text"
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyPress={(e) => {
          e.which === 13 && e.preventDefault()
        }}
        onBlur={onBlur}
        value={value}
        name={name}
        {...props}
      />
    </>
  )
}

export default StringInput
