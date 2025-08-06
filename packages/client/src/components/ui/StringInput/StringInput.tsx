import { TitleElement } from '../TitleElement'
import Control from './Control/Control'

// Компонент ввода строк
interface StringInputProps
  extends Omit<
    React.HTMLProps<HTMLInputElement>,
    'value' | 'onChange' | 'onBlur'
  > {
  title: string
  placeholder: string
  onChange: (value: string) => void
  value: string
  onBlur?: () => void
  error?: string | boolean
  name?: string
}
export default function StringInput({
  title,
  error,
  placeholder,
  onChange,
  value,
  onBlur,
  name,
}: StringInputProps) {
  return (
    <>
      <TitleElement title={title} />
      <Control
        error={error}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
      />
    </>
  )
}
