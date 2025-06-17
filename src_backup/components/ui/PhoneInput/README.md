# PhoneInput

## Описание

`PhoneInput` - это компонент для ввода номера телефона, который может быть дополнен заголовком и подсказкой.

## Props

- **value (string)**: Значение введенного номера телефона.
- **handleChange (function)**: Обработчик изменения введенного номера телефона.
- **disableCurrency (boolean, опционально)**: Флаг, указывающий на отключение выбора валюты. По умолчанию `false`.
- **title (string, опционально)**: Заголовок компонента.
- **hasTooltip (boolean, опционально)**: Флаг, указывающий на наличие подсказки.
- **name (string)**: Имя компонента.
- **placeholder (string)**: Заполнитель для поля ввода номера телефона.

## Пример использования

```jsx
import PhoneInput from './PhoneInput'

const MyComponent = () => {
  const phoneNumber = '+1 123-456-7890'

  return (
    <PhoneInput
      value={phoneNumber}
      handleChange={(newPhoneNumber) =>
        console.log('Phone number changed:', newPhoneNumber)
      }
      disableCurrency={true}
      title="Phone Number"
      hasTooltip={true}
      name="phone"
      placeholder="Enter your phone number"
    />
  )
}
```
