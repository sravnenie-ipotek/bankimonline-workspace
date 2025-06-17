import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx';
import MobileChangeLanguage from '@components/layout/Sidebar/MobileMenu/MobileChangeLanguage/MobileChangeLanguage.tsx';
import Navigation from '@components/layout/Sidebar/MobileMenu/Navigation/Navigation.tsx';
import SocialList from '@components/layout/Sidebar/MobileMenu/SocialList/SocialList.tsx';
import styles from './MobileMenu.module.scss';
const cx = classNames.bind(styles);
const MobileMenu = ({ isOpen, onClick }) => {
    return (_jsxs("div", { className: cx('container', {
            container_open: isOpen,
        }), children: [_jsx(Header, { onClose: onClick }), _jsxs("div", { className: cx('body'), children: [_jsx(Navigation, {}), _jsx(MobileChangeLanguage, {})] }), _jsx(SocialList, {})] }));
};
export default MobileMenu;
