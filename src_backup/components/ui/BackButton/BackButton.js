import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './backButton.module.scss';
const cx = classNames.bind(styles);
// Компонент кнопки назад
const BackButton = ({ title, handleClick, className }) => {
    return (_jsx("button", { onClick: handleClick, type: "button", className: cx('button', className), children: title }));
};
export default BackButton;
