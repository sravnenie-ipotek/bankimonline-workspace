# SliderInput

`SliderInput` компонент, который отображает слайдер и поле ввода.

## Пропсы

- `value: number`: Текущее значение слайдера.
- `max: number`: Максимальное значение слайдера.
- `min: number`: Минимальное значение слайдера.
- `name: string`: Имя поля ввода.
- `title: string`: Заголовок поля ввода.
- `handleChange: (value: number | null) => void`: Обработчик изменения значения слайдера или поля ввода.
- `error?: string`: Сообщение об ошибке.
- `disableRangeValues?: boolean`: Флаг, отключающий отображение минимального и максимального значений.
- `tooltip?: string`: Текст всплывающей подсказки.
- `disableCurrency?: boolean`: Флаг для отключения форматирования валюты.
- `unitsMax?: string, unitsMin?: string`: Единицы измерения для минимального и максимального значений.

## Example

```jsx
import SliderInput from './SliderInput'

const App = () => {
  const handleChange = (value: number) => {
    console.log(value)
  }

  return (
    <SliderInput
      value={50}
      max={100}
      min={0}
      name="mySlider"
      title="Choose a Value"
      handleChange={handleChange}
    />
  )
}

export default App
```
