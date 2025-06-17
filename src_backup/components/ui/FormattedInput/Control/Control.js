import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import { CurrencyIcon } from '@assets/icons/CurrencyIcon';
import styles from './control.module.scss';
const cx = classnames.bind(styles);
export function convertInputToNumber(value) {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue ? parseInt(numericValue, 10) : '';
}
const Control = ({ name, value, handleChange, placeholder, disableCurrency, error, onBlur, size, rightSection, type = 'comma', }) => {
    const formattedValue = value !== null ? value.toLocaleString('en-US') : '';
    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        switch (type) {
            case 'numeric': {
                if (/^-?\d*\.?\d*$/.test(inputValue)) {
                    handleChange(inputValue);
                }
                break;
            }
            case 'comma': {
                handleChange(convertInputToNumber(inputValue));
                break;
            }
            case 'default': {
                handleChange(inputValue);
                break;
            }
            default: {
                handleChange(inputValue);
                break;
            }
        }
    };
    return (_jsxs("div", { className: cx('container', `${error && 'error'}`), children: [_jsx("input", { className: cx(name, 'input', { [`${size}`]: size }), type: "text", placeholder: placeholder, value: formattedValue, onChange: handleInputChange, onBlur: onBlur }), !disableCurrency && !rightSection ? (_jsx("div", { className: cx('currencyImage'), children: _jsx(CurrencyIcon, {}) })) : (_jsx("div", { className: cx('currencyImage'), children: rightSection }))] }));
};
export default Control;
