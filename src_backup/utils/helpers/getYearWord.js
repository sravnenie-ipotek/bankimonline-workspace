import i18next from 'i18next';
/**
 * Функция для определения корректного склонения слова "год" в зависимости от числа.
 * Использует i18next для интернационализации.
 *
 * @param {number} num - число, для которого нужно определить склонение.
 * @returns {string} - склоненное слово "год", полученное из i18next.
 *
 * @example
 *
 * const years = getYearWord(5); // Возвращает переведенный эквивалент для "лет"
 * const year = getYearWord(1); // Возвращает переведенный эквивалент для "год"
 * const yearDual = getYearWord(3); // Возвращает переведенный эквивалент для "года"
 */
const getYearWord = (num) => {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11)
        return i18next.t('year_singular');
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits))
        return i18next.t('year_dual');
    return i18next.t('year_plural');
};
export default getYearWord;
