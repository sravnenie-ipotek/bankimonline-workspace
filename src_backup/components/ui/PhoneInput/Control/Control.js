import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import { useEffect, useState } from 'react';
import formatNumeric from '@src/utils/helpers/fmt.ts';
import styles from './control.module.scss';
// Привязка стилей для использования с classnames
const cx = classnames.bind(styles);
export default function Control({ name, value = '', placeholder, disableCurrency, handleChange, }) {
    // Локальное состояние для управления значением ввода
    const [inputValue, setInputValue] = useState(value);
    // Эффект для форматирования и установки значения ввода
    useEffect(() => {
        const formattedValue = formatNumeric(value);
        setInputValue(formattedValue);
        handleChange(formattedValue);
    }, [handleChange, value]);
    // Обработчик события ввода
    const handleInput = (e) => {
        const inputEvent = e.nativeEvent;
        const res = patternMatch({
            input: e.currentTarget.value,
            key: inputEvent.data,
        });
        if (res !== null) {
            setInputValue(res);
        }
        handleChange(res);
    };
    // Функция для проверки и форматирования введенного значения
    function patternMatch({ input, key, }) {
        try {
            const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
            if (keys.indexOf(key || '') === -1) {
                input = input.replaceAll(key || '', '');
                return input;
            }
            return formatNumeric(input);
        }
        catch {
            return null;
        }
    }
    // Рендер компонента
    return (_jsx("div", { className: cx('container'), children: _jsx("div", { className: cx('box'), children: _jsxs("div", { className: cx('inputWrapper'), children: [_jsx("input", { className: cx(name, 'input'), type: "tel", maxLength: 19, placeholder: placeholder, value: inputValue, onInput: handleInput }), disableCurrency === false ? (_jsx("img", { className: cx('currencyIcon'), alt: "", src: "/static/calculate-credit/currencies.svg" })) : (_jsx("div", { className: cx('emptyDiv') }))] }) }) }));
}
