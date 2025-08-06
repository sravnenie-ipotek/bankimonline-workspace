# Calendar

## Описание

`Calendar` - это компонент, предназначенный для отображения интерактивного календаря с возможностью выбора даты.

## Props

- **title (string)**: Заголовок компонента.
- **style (object, опционально)**: Стили для компонента.
- **value (Date, опционально)**: Выбранная дата.
- **onChange (function)**: Обработчик изменения выбранной даты.
- **placeholder (string)**: Заполнитель для поля ввода календаря.
- **error (boolean, опционально)**: Флаг, указывающий на наличие ошибки.
- **onBlur (function, опционально)**: Обработчик события потери фокуса.

## Пример использования

```jsx
import Calendar from './Calendar'

const MyComponent = () => {
  return (
    <Calendar
      title="Выберите дату"
      value={new Date()}
      onChange={(date) => console.log(date)}
      placeholder="Выберите дату"
    />
  )
}
```
