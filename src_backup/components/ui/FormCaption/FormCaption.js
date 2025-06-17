import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './formCaption.module.scss';
const cx = classNames.bind(styles);
// Компонент для заголовка формы
const FormCaption = ({ title, subtitle }) => {
    return (_jsxs("div", { className: cx('form'), children: [_jsx("div", { className: cx('form-caption'), children: title }), _jsx("div", { className: cx('form-caption-subtitle'), children: subtitle })] }));
};
export default FormCaption;
