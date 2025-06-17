# Row

## Описание

`Row` - это компонент, предназначенный для группировки других компонентов в строку, устанавливая между ними определенное расстояние или стили.

## Props

- **children (React.ReactNode)**: Дочерние элементы, которые будут размещены в строке.

## Пример использования

```jsx
import Row from './Row'

const MyComponent = () => {
  return (
    <Row>
      <div className="item">Item 1</div>
      <div className="item">Item 2</div>
      <div className="item">Item 3</div>
    </Row>
  )
}
```
