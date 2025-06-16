import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router';
import styles from './Header.module.scss';
const cx = classNames.bind(styles);
// Компонент логотипа
const Logo = () => {
    const navigate = useNavigate();
    return (_jsx("a", { className: cx('logo'), onClick: () => navigate('/'), children: _jsx("img", { alt: "", src: "/static/primary-logo05-1.svg", className: 'logo' }) }));
};
export default Logo;
