# CodeInput

## Описание

`CodeInput` - это компонент для ввода 4-х значного кода.

## Props

- **otpValue (string)**: Значение кода.
- **setOtpValue (function)**: Обработчик изменения значения кода.
- **error (string, опционально)**: Текст ошибки, отображаемый под компонентом в случае ошибки.

## Пример использования

```jsx
import CodeInput from './CodeInput'

const MyComponent = () => {
  const [otpValue, setOtpValue] = useState('')
  const error = 'Неверный код'

  return (
    <CodeInput otpValue={otpValue} setOtpValue={setOtpValue} error={error} />
  )
}
```
