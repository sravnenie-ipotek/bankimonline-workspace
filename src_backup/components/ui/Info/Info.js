import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { InfoIcon } from '../../../assets/icons/InfoIcon';
import styles from './info.module.scss';
const cx = classNames.bind(styles);
const Info = ({ title }) => {
    return (_jsxs("div", { className: cx('info'), children: [_jsx(InfoIcon, { className: cx('info-icon'), size: 24 }), _jsx("p", { className: cx('info-title'), children: title })] }));
};
export default Info;
