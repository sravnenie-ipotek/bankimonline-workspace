# ProgrammCard

## Описание

`ProgrammCard` - это компонент для отображения информации о программе ипотеки или кредита. Он включает в себя заголовок, общую сумму и ежемесячный платеж, процентную ставку и срок программы.

## Props

- **title (string)**: Заголовок программы.
- **mortgageAmount (number)**: Общая сумма ипотеки или кредита.
- **monthlyPayment (number)**: Ежемесячный платеж.
- **percent (number)**: Процентная ставка.
- **period (number)**: Срок программы в месяцах.

## Пример использования

```jsx
import ProgrammCard from './ProgrammCard'

const MyComponent = () => {
  const programTitle = 'Ипотека на жилье'
  const totalAmount = 250000
  const monthlyPayment = 2000
  const interestRate = 3.5
  const programPeriod = 25

  return (
    <ProgrammCard
      title={programTitle}
      mortgageAmount={totalAmount}
      monthlyPayment={monthlyPayment}
      percent={interestRate}
      period={programPeriod}
    />
  )
}
```
