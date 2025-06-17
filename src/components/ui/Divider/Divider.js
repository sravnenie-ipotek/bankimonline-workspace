import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './divider.module.scss';
const cx = classNames.bind(styles);
// Компонент разделителя полей в форме
const Divider = () => {
    return _jsx("div", { className: cx('divider') });
};
export default Divider;
