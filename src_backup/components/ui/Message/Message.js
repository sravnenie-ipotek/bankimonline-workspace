import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { WarningCircleIcon } from '@assets/icons/WarningCircleICon';
import styles from './message.module.scss';
const cx = classNames.bind(styles);
const Message = ({ children, ...props }) => {
    return (_jsxs("div", { className: cx('message'), ...props, children: [_jsx("div", { className: cx('message-icon'), children: _jsx(WarningCircleIcon, { color: "#FBE54D", size: 18 }) }), _jsx("div", { className: cx('message-content'), children: children })] }));
};
export default Message;
