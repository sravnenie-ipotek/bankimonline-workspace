# YesNo

## Описание

`YesNo` - компонент, предназначенный для отображения двух кнопок с возможностью выбора между "yes" и "no". Компонент позволяет пользователю выбирать один из двух вариантов ответа.

## Props

- **value (string | null)**: Текущее значение выбора. Может быть "yes", "no" или `null`.
- **onChange (function)**: Функция, вызываемая при изменении выбранного значения. Принимает новое значение в качестве аргумента.
- **error (string | boolean)**: Опциональное свойство, указывающее на наличие ошибки. Если есть ошибка, можно передать её текст, либо `true`, чтобы отобразить ошибку без текста.

## Пример использования

```jsx
import YesNo from './YesNo'

const MyComponent = () => {
  const [answer, setAnswer] = useState(null)

  const handleChange = (newValue) => {
    setAnswer(newValue)
  }

  return <YesNo value={answer} onChange={handleChange} error={false} />
}
```
