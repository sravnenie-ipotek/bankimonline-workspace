/**
 * Функция для расчета срока ипотеки в годах на основе ежемесячного платежа.
 * 
 * ВАЖНО: Эта функция больше НЕ использует hardcoded значения процентной ставки.
 * Все параметры теперь должны быть получены из базы данных через API.
 *
 * @param {number} totalAmount - общая сумма ипотеки.
 * @param {number} initialPayment - первоначальный взнос.
 * @param {number} monthlyPayment - ежемесячный платеж.
 * @param {number} annualRate - годовая процентная ставка (ОБЯЗАТЕЛЬНЫЙ параметр, больше нет дефолта).
 * @returns {number} - срок ипотеки в годах, округленный в меньшую сторону до целого числа.
 *
 * @example
 *
 * // СТАРЫЙ способ (БОЛЬШЕ НЕ ПОДДЕРЖИВАЕТСЯ):
 * // const period = calculatePeriod(1000000, 200000, 8544); // Использовал hardcoded 5%
 * 
 * // НОВЫЙ способ (используйте calculationService):
 * // const rate = await calculationService.getCurrentRate('mortgage');
 * // const period = calculatePeriod(1000000, 200000, 8544, rate);
 *
 * @throws
 * Возвращает 0, если любой из входных параметров нулевой, отрицательный или если расчетный срок оказывается нулевым или отрицательным.
 */

const calculatePeriod = (
  totalAmount: number | null,
  initialPayment: number,
  monthlyPayment: number,
  annualRate: number
) => {
  if (totalAmount === null) {
    return 1
  }

  if (initialPayment === null) {
    return 1
  }

  // Handle NaN inputs
  if (Number.isNaN(totalAmount) || Number.isNaN(initialPayment) || Number.isNaN(monthlyPayment) || Number.isNaN(annualRate)) {
    return NaN
  }

  // Сначала вычитаем первоначальный взнос из общей суммы
  const loanAmount = totalAmount - initialPayment

  // Расчет ежемесячной ставки
  const monthlyRate = annualRate / 12 / 100

  // Проверка на нулевые или отрицательные значения
  if (loanAmount <= 0 || monthlyRate <= 0 || monthlyPayment <= 0) {
    return 0
  }

  // Check if payment is insufficient to cover interest (impossible scenario)
  if (monthlyPayment <= loanAmount * monthlyRate) {
    return NaN // Mathematically impossible - payment doesn't exceed interest
  }

  // Расчет срока кредита в месяцах
  const termInMonths =
    Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyRate)) /
    Math.log(1 + monthlyRate)

  // Check for mathematical validity
  if (!Number.isFinite(termInMonths) || termInMonths <= 0) {
    return NaN
  }

  // Переводим срок кредита в года
  const termInYears = termInMonths / 12

  // Возвращаем целое число
  return Math.trunc(termInYears)
}

export default calculatePeriod
