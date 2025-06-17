function format(value, format, lng) {
    if (!format)
        return String(value);
    if (format.startsWith('date')) {
        return String(formatDate(value, format, lng || 'ru'));
    }
    if (format.startsWith('number')) {
        return String(formatNumber(value, format, lng || 'ru'));
    }
    return String(value); // Convert value to string
}
function formatDate(value, format, lng) {
    const options = toOptions(format, 'date');
    if (options === null) {
        return value;
    }
    return new Intl.DateTimeFormat(lng, options).format(value);
}
function formatNumber(value, format, lng) {
    const options = toOptions(format, 'number');
    return options === null
        ? value
        : new Intl.NumberFormat(lng, options).format(value);
}
function toOptions(format, specifier) {
    if (format.trim() === specifier) {
        return {};
    }
    else {
        try {
            return JSON.parse(toJsonString(format, specifier));
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    }
}
function toJsonString(format, specifier) {
    const inner = format
        .trim()
        .replace(specifier, '')
        .replace('(', '')
        .replace(')', '')
        .split(';')
        .map((param) => param
        .split(':')
        .map((name) => `"${name.trim()}"`)
        .join(':'))
        .join(',');
    return '{' + inner + '}';
}
export default format;
