import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './control.module.scss';
const cx = classNames.bind(styles);
const StringInput = ({ placeholder, onChange, value, error, onBlur, name, ...props }) => {
    const handleInputChange = (event) => {
        onChange(event.target.value);
    };
    return (_jsx(_Fragment, { children: _jsx("input", { className: cx('string-input', `${error && 'error'}`), type: "text", placeholder: placeholder, onChange: handleInputChange, onKeyPress: (e) => {
                e.which === 13 && e.preventDefault();
            }, onBlur: onBlur, value: value, name: name, ...props }) }));
};
export default StringInput;
