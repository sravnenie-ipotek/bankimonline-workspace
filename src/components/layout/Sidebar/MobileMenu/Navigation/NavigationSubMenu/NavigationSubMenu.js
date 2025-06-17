import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx';
import styles from './NavigationSubMenu.module.scss';
const cx = classNames.bind(styles);
const NavigationSubMenu = ({ items, isOpen, onClose, }) => {
    return (_jsx(_Fragment, { children: _jsxs("nav", { className: cx('nav', {
                nav_open: isOpen,
            }), children: [_jsx(Header, { onClose: onClose }), _jsx("ul", { className: cx('list'), children: items.map((item) => (_jsx("li", { className: cx('item'), children: _jsx(Link, { to: item.path, children: item.title }) }, item.title))) })] }) }));
};
export default NavigationSubMenu;
