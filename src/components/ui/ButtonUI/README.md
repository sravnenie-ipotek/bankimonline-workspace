# Button

## Описание

`Button` - это компонент кнопки.

## Props

- **disabled (boolean, опционально)**: Флаг, указывающий, заблокирована ли кнопка.
- **type (string, опционально)**: Тип кнопки.
- **children (React элементы)**: Дочерние элементы, отображаемые внутри кнопки.
- **variant (string, опционально)**: Вариант стиля кнопки. По умолчанию 'primary'.
- **size (string, опционально)**: Размер кнопки. По умолчанию 'medium'.
- **className (string, опционально)**: Дополнительные CSS-классы для кнопки.
- **to (string, опционально)**: URL для перехода, если кнопка используется как ссылка.
- **icon (React элемент, опционально)**: Иконка, отображаемая рядом с текстом кнопки.
- **isDisabled (boolean, опционально)**: Дополнительный флаг, указывающий, заблокирован ли компонент.
- **rest (прочие свойства)**: Распространение всех остальных свойств на кнопку.

## Пример использования

```jsx
import Button from './Button'

const MyComponent = () => {
  return (
    <Button
      disabled={false}
      type="button"
      variant="primary"
      size="medium"
      className="custom-class"
      to="/some-url"
      icon={<MyIcon />}
      isDisabled={false}
    >
      Нажми меня
    </Button>
  )
}
```
