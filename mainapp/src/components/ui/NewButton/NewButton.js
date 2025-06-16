import { jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './button.module.scss';
const cx = classNames.bind(styles);
const NewButton = ({ text, color, onChange, leftSection, rightSection, }) => {
    return (_jsxs("button", { type: "button", onClick: onChange, className: cx('button', { warning: color === 'warning' }), children: [leftSection && leftSection, text, rightSection && rightSection] }));
};
export default NewButton;
