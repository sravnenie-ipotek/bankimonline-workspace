/**
 * Функция для расчета ежемесячного платежа по ипотеке.
 * 
 * ВАЖНО: Эта функция больше НЕ использует hardcoded значения процентной ставки.
 * Все параметры теперь должны быть получены из базы данных через API.
 *
 * @param {number} totalAmount - общая сумма ипотеки.
 * @param {number} initialPayment - первоначальный взнос.
 * @param {number} period - период ипотеки в годах.
 * @param {number} annualRate - годовая процентная ставка (ОБЯЗАТЕЛЬНЫЙ параметр, больше нет дефолта).
 * @returns {number} - размер ежемесячного платежа, округленный в меньшую сторону до целого числа.
 *
 * @example
 *
 * // СТАРЫЙ способ (БОЛЬШЕ НЕ ПОДДЕРЖИВАЕТСЯ):
 * // const payment = calculateMonthlyPayment(1000000, 200000, 10); // Использовал hardcoded 5%
 * 
 * // НОВЫЙ способ (используйте calculationService):
 * // const rate = await calculationService.getCurrentRate('mortgage');
 * // const payment = calculateMonthlyPayment(1000000, 200000, 10, rate);
 *
 * @throws
 * Возвращает 0, если любой из входных параметров нулевой, отрицательный или если первоначальный взнос больше или равен общей сумме.
 */

const calculateMonthlyPayment = (
  totalAmount: number | null,
  initialPayment: number | null,
  period: number,
  annualRate: number
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
