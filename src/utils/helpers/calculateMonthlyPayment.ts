/**
 * Функция для расчета ежемесячного платежа по ипотеке.
 *
 * @param {number} totalAmount - общая сумма ипотеки.
 * @param {number} initialPayment - первоначальный взнос.
 * @param {number} period - период ипотеки в годах.
 * @param {number} [annualRate=5] - годовая процентная ставка (по умолчанию 5%).
 * @returns {number} - размер ежемесячного платежа, округленный в меньшую сторону до целого числа.
 *
 * @example
 *
 * const payment = calculateMonthlyPayment(1000000, 200000, 10, 5); // Возвращает, например, 8544
 * const paymentWithDefaultRate = calculateMonthlyPayment(1000000, 200000, 10); // Использует ставку 5% по умолчанию
 *
 * @throws
 * Возвращает 0, если любой из входных параметров нулевой, отрицательный или если первоначальный взнос больше или равен общей сумме.
 */

const calculateMonthlyPayment = (
  totalAmount: number | null,
  initialPayment: number | null,
  period: number,
  annualRate: number = 5
): number => {
  if (totalAmount === null) {
    return 1
  }

  if (initialPayment === null) {
    return 1
  }
  // Проверка на нулевые или отрицательные значения
  if (period <= 0 || totalAmount <= 0 || annualRate <= 0) {
    return 0
  }

  // Проверка на то, чтобы сумма ипотеки не была больше первоначального взноса
  if (initialPayment >= totalAmount) {
    return 0
  }

  // Сначала вычитаем первоначальный взнос из общей суммы
  const loanAmount = totalAmount - initialPayment

  // Расчет ежемесячной ставки
  const monthlyRate = annualRate / 12 / 100

  // Расчет общей ставки
  const totalRate = Math.pow(1 + monthlyRate, period * 12)

  // Расчет ежемесячного платежа
  const monthlyPayment =
    (loanAmount * monthlyRate * totalRate) / (totalRate - 1)

  // Возвращаем целое число
  return Math.trunc(monthlyPayment)
}

export default calculateMonthlyPayment
