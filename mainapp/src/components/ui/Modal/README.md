# Modal

## Описание

`Modal` - это компонент модального окна, предназначенного для отображения диалоговых окон с различным контентом.

## Props

- **title (string, опционально)**: Заголовок модального окна.
- **onCancel (function, опционально)**: Обработчик отмены действия при закрытии модального окна.
- **isVisible (boolean, опционально)**: Флаг видимости модального окна. По умолчанию `false`.
- **children (React элементы)**: Содержимое модального окна.

## Пример использования

```jsx
import Modal from './Modal'

const MyComponent = () => {
  const showModal = true

  return (
    <Modal
      isVisible={showModal}
      title="Модальное окно"
      onCancel={() => console.log('Отмена')}
    >
      <p>Содержимое модального окна</p>
    </Modal>
  )
}
```
