/**
 * Формула расчета кредита аннуитентными платежами
 * 
 * ВАЖНО: Эта функция больше НЕ использует hardcoded значения процентной ставки.
 * Все параметры теперь должны быть получены из базы данных через API.
 * 
 * @param {number} sum - сумма кредита
 * @param {number} period - срок кредита в ГОДАХ
 * @param {number} percentageOfLoan - процент кредита (ОБЯЗАТЕЛЬНЫЙ параметр, больше нет дефолта 15%)
 * @returns {number} - размер ежемесячного платежа
 * 
 * @example
 * // СТАРЫЙ способ (БОЛЬШЕ НЕ ПОДДЕРЖИВАЕТСЯ):
 * // const payment = calculateCreditAnnuityPayment(100000, 5); // Использовал hardcoded 15%
 * 
 * // НОВЫЙ способ (используйте calculationService):
 * // const rate = await calculationService.getCurrentRate('credit');
 * // const payment = calculateCreditAnnuityPayment(100000, 5, rate);
 */

export const calculateCreditAnnuityPayment = (
  sum: number,
  period: number,
  percentageOfLoan: number
): number => {
  const periodInMonth = period * 12
  const monthlyPercentageOfLoan = percentageOfLoan / 12 / 100

  const annuityEfficiency =
    (monthlyPercentageOfLoan * (1 + monthlyPercentageOfLoan) ** periodInMonth) /
    ((1 + monthlyPercentageOfLoan) ** periodInMonth - 1)

  return Math.ceil(sum * annuityEfficiency)
}
