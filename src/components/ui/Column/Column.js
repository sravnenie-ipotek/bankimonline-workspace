import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './column.module.scss';
const cx = classNames.bind(styles);
const Column = ({ children, ...props }) => {
    return (_jsx("div", { className: cx('column'), ...props, children: children }));
};
export default Column;
