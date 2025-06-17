# Error

## Описание

`Error` - это компонент, предназначенный для отображения сообщений об ошибках.

## Props

- **error (string)**: Текст сообщения об ошибке.

## Пример использования

```jsx
import Error from './Error'

const MyComponent = () => {
  const errorMessage = 'Произошла ошибка при выполнении операции.'

  return <Error error={errorMessage} />
}
```
