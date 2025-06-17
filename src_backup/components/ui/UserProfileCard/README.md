# UserProfileCard

## Описание

`UserProfileCard` - компонент, предназначенный для отображения информации о пользователе, включая имя, фамилию и номер телефона. Компонент также предоставляет возможность редактирования и удаления информации о пользователе.

## Props

- **name (string)**: Имя и фамилия пользователя.
- **phone (string)**: Номер телефона пользователя.
- **enableEdit (boolean)**: Флаг, указывающий, разрешено ли редактирование информации о пользователе.
- **onEdit (function)**: Функция, вызываемая при нажатии на опцию редактирования.
- **onDelete (function)**: Функция, вызываемая при нажатии на опцию удаления.

## Пример использования

```jsx
import UserProfileCard from './UserProfileCard'

const MyComponent = () => {
  return (
    <UserProfileCard
      name="John Doe"
      phone="+1 123-456-7890"
      enableEdit={true}
      onEdit={() => console.log('Edit clicked')}
      onDelete={() => console.log('Delete clicked')}
    />
  )
}
```
