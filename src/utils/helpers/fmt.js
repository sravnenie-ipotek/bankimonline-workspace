// форматирование числовых значений
const formatNumeric = (input, nocomma) => {
    try {
        if (input.length > 1000000000000) {
            return '';
        }
        if (typeof nocomma === 'undefined') {
            return Intl.NumberFormat('en').format(Number(input.replace(/,/g, '')));
        }
        return input.replaceAll(',', '');
    }
    catch {
        return '';
    }
};
export default formatNumeric;
