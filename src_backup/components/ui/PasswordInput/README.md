# PasswordInput

## Описание

`PasswordInput` - это компонент для ввода пароля, который позволяет пользователю скрыть или показать введенный пароль.

## Props

- **value (string)**: Значение введенного пароля.
- **language (string)**: Язык компонента.
- **label (string, опционально)**: Метка для поля ввода пароля.
- **placeholder (string)**: Заполнитель для поля ввода пароля.
- **handleChange (function)**: Обработчик изменения введенного пароля.
- **error (string, опционально)**: Текст ошибки, отображаемый в случае ошибки.

## Пример использования

```jsx
import PasswordInput from './PasswordInput'

const MyComponent = () => {
  const password = 'mySecurePassword'
  const language = 'en'

  return (
    <PasswordInput
      value={password}
      language={language}
      label="Password"
      placeholder="Enter your password"
      handleChange={(newPassword) =>
        console.log('Password changed:', newPassword)
      }
      error="Invalid password"
    />
  )
}
```
