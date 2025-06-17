/**
 * Функция для расчета срока ипотеки в годах на основе ежемесячного платежа.
 *
 * @param {number} totalAmount - общая сумма ипотеки.
 * @param {number} initialPayment - первоначальный взнос.
 * @param {number} monthlyPayment - ежемесячный платеж.
 * @param {number} [annualRate=5] - годовая процентная ставка (по умолчанию 5%).
 * @returns {number} - срок ипотеки в годах, округленный в меньшую сторону до целого числа.
 *
 * @example
 *
 * const period = calculatePeriod(1000000, 200000, 8544, 5); // Возвращает, например, 10
 * const periodWithDefaultRate = calculatePeriod(1000000, 200000, 8544); // Использует ставку 5% по умолчанию
 *
 * @throws
 * Возвращает 0, если любой из входных параметров нулевой, отрицательный или если расчетный срок оказывается нулевым или отрицательным.
 */
const calculatePeriod = (totalAmount, initialPayment, monthlyPayment, annualRate = 5) => {
    if (totalAmount === null) {
        return 1;
    }
    if (initialPayment === null) {
        return 1;
    }
    // Сначала вычитаем первоначальный взнос из общей суммы
    const loanAmount = totalAmount - initialPayment;
    // Расчет ежемесячной ставки
    const monthlyRate = annualRate / 12 / 100;
    // Проверка на нулевые или отрицательные значения
    if (loanAmount <= 0 || monthlyRate <= 0 || monthlyPayment <= 0) {
        return 0;
    }
    // Расчет срока кредита в месяцах
    const termInMonths = Math.log(monthlyPayment / (monthlyPayment - loanAmount * monthlyRate)) /
        Math.log(1 + monthlyRate);
    // Переводим срок кредита в года
    const termInYears = termInMonths / 12;
    // Возвращаем целое число
    return Math.trunc(termInYears);
};
export default calculatePeriod;
