export function formatPhoneNumber(phoneNumber, language) {
    const numericOnly = phoneNumber.replace(/\D/g, '');
    // Форматируем номер телефона в зависимости от языка
    const formattedPhoneNumber = language === 'he'
        ? `+ ${numericOnly.slice(0, 3)} ${numericOnly.slice(3, 6)} ${numericOnly.slice(6)}`
        : `+${numericOnly.slice(0, 1)} (${numericOnly.slice(1, 4)}) ${numericOnly.slice(4, 7)}-${numericOnly.slice(7)}`;
    return formattedPhoneNumber;
}
