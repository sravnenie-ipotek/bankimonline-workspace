import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { WarningOctagonIcon } from '@assets/icons/warningOctagonIcon';
import styles from './error.module.scss';
const cx = classNames.bind(styles);
const Error = ({ error }) => {
    return (_jsxs("div", { className: cx('error'), children: [_jsx(WarningOctagonIcon, {}), _jsx("p", { className: cx('error-title'), children: error })] }));
};
export default Error;
