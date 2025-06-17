import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import { useEffect } from 'react';
import Control from './Control/Control';
import Title from './Title';
import styles from './formattedInput.module.scss';
const cx = classnames.bind(styles);
const PhoneInput = (props) => {
    const { value, handleChange, disableCurrency, title, hasTooltip, name, placeholder, } = props;
    useEffect(() => {
        if (typeof value !== 'undefined' && value) {
            handleChange(value);
        }
    }, []);
    return (_jsxs("div", { className: cx('container'), children: [title && _jsx(Title, { title: title, hasTooltip: hasTooltip }), _jsx(Control, { name: name, placeholder: placeholder, disableCurrency: disableCurrency === undefined ? false : disableCurrency, handleChange: handleChange, value: value })] }));
};
export default PhoneInput;
