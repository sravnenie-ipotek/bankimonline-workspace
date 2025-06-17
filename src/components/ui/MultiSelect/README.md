# MultiSelect Component

`MultiSelect` это React-компонент для создания выпадающего списка с возможностью множественного выбора. Он позволяет пользователю выбирать несколько значений из списка и даже искать их, если это нужно.

## Пропсы

- `data: string[]`: Массив строк, которые будут отображены в выпадающем списке.
- `placeholder: string`: Заполнитель для поля ввода.

### Необязательные пропсы

- `fieldName?: string`: Имя поля ввода.
- `value?: string[]`: Выбранные значения.
- `error?: string | boolean | string[]`: Сообщение об ошибке.
- `onChange?: (value: string[]) => void`: Функция обратного вызова при изменении значения.
- `onBlur?: () => void`: Функция обратного вызова при потере фокуса. Можно использовать для отображения ошибки
- `searchable?: boolean`: Флаг, делающий список поисковым.
- `searchPlaceholder?: string`: Заполнитель для поля поиска.
- `nothingFoundText?: string`: Текст, отображаемый, если ничего не найдено.

## Example

```jsx
import MultiSelect from './MultiSelect'

const App = () => {
  const handleChange = (selectedItems) => {
    console.log(selectedItems)
  }

  return (
    <MultiSelect
      data={['Apple', 'Banana', 'Cherry']}
      placeholder="Select Fruits"
      onChange={handleChange}
    />
  )
}

export default App
```
