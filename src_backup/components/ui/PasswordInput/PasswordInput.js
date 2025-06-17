import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import cn from 'classnames';
import classNames from 'classnames/bind';
import { useId, useState } from 'react';
import { HiddenEyeIcon } from '@assets/icons/HiddenEyeIcon';
import ErrorBlock from '@components/ui/ErrorBlock';
import { TitleElement } from '../TitleElement';
import styles from './PasswordInput.module.scss';
const cx = classNames.bind(styles);
export function PasswordInput({ value, language, title, placeholder, handleChange, error, onBlur, label, }) {
    const [isShown, setIsShown] = useState(false);
    const id = useId();
    const handleChangeValue = (event) => {
        const newValue = event.target.value;
        handleChange(newValue);
    };
    const handleShowPassword = () => {
        setIsShown((prevState) => !prevState);
    };
    return (_jsxs(_Fragment, { children: [title && _jsx(TitleElement, { title: title }), _jsxs("div", { className: styles.passwordInput, children: [_jsxs("div", { className: styles.wrapper, children: [_jsx("input", { id: id, value: value, onChange: handleChangeValue, onBlur: onBlur, placeholder: placeholder, type: isShown ? 'text' : 'password', className: cx('password', { error: error }, {
                                    ru: [styles.inputRU],
                                    he: [styles.inputHE],
                                }[language]), autoComplete: "off" }), _jsx("button", { type: "button", className: cn(styles.button, {
                                    ru: [styles.buttonRU],
                                    he: [styles.buttonHE],
                                }[language]), onClick: handleShowPassword, children: _jsx(HiddenEyeIcon, { size: 24, color: "white" }) })] }), error && _jsx(ErrorBlock, { error: error })] })] }));
}
