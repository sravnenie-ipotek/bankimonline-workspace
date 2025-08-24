/**
 * Расчет оставшейся суммы к выплате по ипотеке
 * 
 * ВАЖНО: Эта функция больше НЕ использует hardcoded значения процентной ставки.
 * Все параметры теперь должны быть получены из базы данных через API.
 * 
 * @param {number | null} remainingMortgageAmount - оставшаяся сумма ипотеки
 * @param {number} remainingYears - оставшиеся годы
 * @param {number} annualRate - годовая процентная ставка (ОБЯЗАТЕЛЬНЫЙ параметр)
 * @returns {number} - общая сумма к выплате
 */

const calculateRemainingAmount = (
  remainingMortgageAmount: number | null,
  remainingYears: number,
  annualRate: number
): number => {
  if (remainingMortgageAmount === null) {
    return 0
  }

  // Handle NaN inputs
  if (Number.isNaN(remainingMortgageAmount) || Number.isNaN(remainingYears) || Number.isNaN(annualRate)) {
    return NaN
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
