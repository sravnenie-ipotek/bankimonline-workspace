const calculateRemainingAmount = (
  remainingMortgageAmount: number | null,
  remainingYears: number,
  annualRate: number = 5
): number => {
  if (remainingMortgageAmount === null) {
    return 0
  }
  // Проверка на нулевые или отрицательные значения
  if (remainingMortgageAmount <= 0 || remainingYears <= 0 || annualRate <= 0) {
    return 0
  }

  // Расчет общей суммы, которую нужно будет заплатить
  const totalAmountToPay =
    remainingMortgageAmount * (1 + (annualRate * remainingYears) / 100)

  // Возвращаем целое число
  return Math.trunc(totalAmountToPay)
}

export default calculateRemainingAmount
