## DropdownMenu

### Описание

`DropdownMenu` — компонент, который объединяет `TitleElement` и `Dropdown`, предоставляя универсальный интерфейс для отображения выпадающего списка с заголовком.

### Props

- **data (string[])**: Массив строк, представляющий данные для отображения в выпадающем списке.
- **title (string)**: Заголовок компонента.
- **placeholder (string)**: Заполнитель, отображаемый в поле ввода выпадающего списка.
- **onChange (function)**: Обработчик изменений, вызывается при выборе элемента списка.
- **value (string)**: Текущее выбранное значение.
- **searchable (boolean, optional)**: Флаг, указывающий, можно ли искать элементы в списке.
- **searchPlaceholder (string, optional)**: Заполнитель для поля поиска, если поиск доступен.
- **nothingFoundText (string, optional)**: Текст, отображаемый, если ничего не найдено при поиске.

### Пример использования

```jsx
const data = ['Apple', 'Banana', 'Orange']

const App = () => {
  const [selectedValue, setSelectedValue] = useState('')

  const handleChange = (value) => {
    setSelectedValue(value)
  }

  return (
    <DropdownMenu
      data={data}
      title="Fruits"
      placeholder="Select a fruit"
      onChange={handleChange}
      value={selectedValue}
      searchable={true}
      searchPlaceholder="Search for a fruit"
      nothingFoundText="No fruits found"
    />
  )
}
```
