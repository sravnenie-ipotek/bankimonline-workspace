import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './container.module.scss';
const cx = classNames.bind(styles);
const Container = ({ children, ...rest }) => {
    return (_jsx("div", { className: cx('container'), ...rest, children: children }));
};
export default Container;
