# ProgressBar

## Описание

`ProgressBar` - это компонент для отображения прогресса выполнения этапов или шагов. Он предоставляет визуальное отображение текущего этапа выполнения.

## Props

- **progress (number)**: Текущий этап выполнения.
- **data (string[])**: Массив данных, представляющих этапы или шаги прогресса.

## Пример использования

```jsx
import ProgressBar from './ProgressBar'

const MyComponent = () => {
  const currentProgress = 3
  const progressData = ['Шаг 1', 'Шаг 2', 'Шаг 3', 'Шаг 4']

  return <ProgressBar progress={currentProgress} data={progressData} />
}
```
