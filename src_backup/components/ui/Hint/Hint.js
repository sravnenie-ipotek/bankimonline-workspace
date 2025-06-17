import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './hint.module.scss';
const cx = classNames.bind(styles);
const Hint = ({ text }) => {
    return _jsx("div", { className: cx('hint'), children: text });
};
export default Hint;
