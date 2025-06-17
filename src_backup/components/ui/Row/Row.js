import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './row.module.scss';
const cx = classNames.bind(styles);
const Row = ({ children, ...rest }) => {
    return (_jsx("div", { className: cx('row'), ...rest, children: children }));
};
export default Row;
