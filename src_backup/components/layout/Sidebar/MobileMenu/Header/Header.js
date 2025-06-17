import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';
const cx = classNames.bind(styles);
const Header = ({ onClose }) => {
    return (_jsxs("div", { className: cx('header'), children: [_jsx(Link, { to: "/", children: _jsx("img", { src: "/static/mobile-menu/logo.svg", alt: "bankimonline" }) }), _jsx("button", { type: "button", onClick: onClose })] }));
};
export default Header;
