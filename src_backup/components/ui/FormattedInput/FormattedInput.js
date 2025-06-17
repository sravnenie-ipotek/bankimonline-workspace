import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import Control from '@components/ui/FormattedInput/Control/Control.tsx';
import TitleElement from '../TitleElement/TitleElement.tsx';
import styles from './formattedInput.module.scss';
const cx = classNames.bind(styles);
const FormattedInput = ({ value, name, title, tooltip, placeholder, disableCurrency, handleChange, error, validation, onBlur, size, }) => {
    return (_jsxs("div", { className: cx('formatted-input'), children: [_jsx(TitleElement, { name: name, title: title, tooltip: tooltip }), _jsx(Control, { name: name, placeholder: placeholder, disableCurrency: disableCurrency, handleChange: handleChange, onBlur: onBlur, value: value, error: error, validation: validation, size: size })] }));
};
export default FormattedInput;
