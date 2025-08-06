# ServiceCard

## Описание

`ServiceCard` - компонент, предназначенный для отображения карточки сервиса. Этот компонент отображает название сервиса, ссылку, и иконку.

## Props

- **title (string)**: Название сервиса.
- **to (string)**: Ссылка, куда переходит пользователь при клике на карточку сервиса.
- **icon (ReactNode)**: Иконка, отображаемая на карточке сервиса.

## Пример использования

```jsx
import ServiceCard from './ServiceCard'

const MyComponent = () => {
  return (
    <ServiceCard
      title="Расчет ипотеки"
      to="/services/calculate-mortgage"
      icon={<MortgageIcon />}
    />
  )
}
```
