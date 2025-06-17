# Ranger

## Описание

`Ranger` - это компонент для слайдера, который позволяет выбирать значения в заданном диапазоне.

## Props

- **min (number)**: Минимальное значение диапазона.
- **max (number)**: Максимальное значение диапазона.
- **step (number)**: Шаг изменения значения.
- **values (number[])**: Массив значений слайдера.
- **onChange (function)**: Обработчик изменения значений слайдера.

## Пример использования

```jsx
import Ranger from './Ranger'

const MyComponent = () => {
  const minRange = 0
  const maxRange = 100
  const stepSize = 5
  const sliderValues = [25, 75]

  const handleSliderChange = (newValues) => {
    console.log('Slider values changed:', newValues)
  }

  return (
    <Ranger
      min={minRange}
      max={maxRange}
      step={stepSize}
      values={sliderValues}
      onChange={handleSliderChange}
    />
  )
}
```
