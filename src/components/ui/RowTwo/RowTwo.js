import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './rowTwo.module.scss';
const cx = classNames.bind(styles);
const RowTwo = ({ children }) => {
    return _jsx("div", { className: cx('row'), children: children });
};
export default RowTwo;
