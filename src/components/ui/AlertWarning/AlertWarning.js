import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { WarningCircleIcon } from '../../../assets/icons/WarningCircleICon';
import styles from './alertWarning.module.scss';
const cx = classNames.bind(styles);
const AlertWarning = ({ children, filled, icon, text, }) => {
    return (_jsxs("div", { className: cx('alert-warning', { filled: filled }), children: [_jsx("div", { className: cx('alert-warning__icon'), children: icon ? icon : _jsx(WarningCircleIcon, {}) }), _jsx("span", { className: cx('alert-warning__text'), children: children ? children : text })] }));
};
export default AlertWarning;
