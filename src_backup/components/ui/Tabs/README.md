# Tabs

## Описание

`Tabs` - это компонент для создания интерфейса вкладок (табов), который позволяет переключаться между различными контентами.

## Props

- **handleChange (function)**: Обработчик изменения активной вкладки.
- **tab (T)**: Значение активной вкладки.
- **tabs (Array<{ value: T, label: string }>)**: Массив вкладок, каждая из которых представлена объектом с `value` (значение вкладки) и `label` (текст вкладки).

## Пример использования

```jsx
import Tabs from './Tabs'

const MyComponent = () => {
  const availableTabs = [
    { value: 'tab1', label: 'Tab 1' },
    { value: 'tab2', label: 'Tab 2' },
    { value: 'tab3', label: 'Tab 3' },
  ]
  const [activeTab, setActiveTab] = useState('tab1')

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
  }

  return (
    <Tabs handleChange={handleTabChange} tab={activeTab} tabs={availableTabs} />
  )
}
```
