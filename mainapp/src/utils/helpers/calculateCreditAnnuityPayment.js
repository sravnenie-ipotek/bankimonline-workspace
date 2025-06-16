//формула расчета кредита аннуитентными платежами
// sum - сумма кредита, period - срок кредита в ГОДАХ, percentageOfLoan - процент кредита
export const calculateCreditAnnuityPayment = (sum, period, percentageOfLoan = 15) => {
    const periodInMonth = period * 12;
    const monthlyPercentageOfLoan = percentageOfLoan / 12 / 100;
    const annuityEfficiency = (monthlyPercentageOfLoan * (1 + monthlyPercentageOfLoan) ** periodInMonth) /
        ((1 + monthlyPercentageOfLoan) ** periodInMonth - 1);
    return Math.ceil(sum * annuityEfficiency);
};
