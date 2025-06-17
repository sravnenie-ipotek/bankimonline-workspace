import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Outlet } from 'react-router-dom';
import Header from '@components/layout/Head/Header.tsx';
import MobileMenu from '@components/layout/Sidebar/MobileMenu/MobileMenu.tsx';
import { SidebarClosed } from '@components/layout/Sidebar/SideberClosed';
import { useToggle } from '@src/hooks/useToggle.ts';
import { useWindowResize } from '@src/hooks/useWindowResize.ts';
import { AuthModal } from '@src/pages/AuthModal';
import Footer from './Footer/Footer';
import styles from './layout.module.scss';
const cx = classNames.bind(styles);
const Layout = () => {
    const location = useLocation();
    const pathMap = location.pathname.split('/');
    const isService = pathMap.includes('services');
    const { i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const { isOn: isOpen, toggle: toggleOpen } = useToggle(false);
    const { isDesktop } = useWindowResize();
    const { isOn: isSubMenuOpen, toggle: toggleSubMenu, set: setSubMenu, } = useToggle(false);
    const { isOn: isBusinessSubMenuOpen, toggle: toggleBusinessSubMenu, set: setBusinessSubMenu, } = useToggle(false);
    const { isOn: isOpenMobileMenu, toggle: toggleMobileMenu } = useToggle(false);
    useEffect(() => {
        if (isOpenMobileMenu) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpenMobileMenu]);
    return (_jsxs(_Fragment, { children: [_jsx(Header, { isMobile: isDesktop, onOpenMobileMenu: toggleMobileMenu }), isOpen && (_jsx("div", { onClick: () => {
                    toggleOpen();
                    setSubMenu(false);
                    setBusinessSubMenu(false);
                }, className: cx('nav_hover') })), !isService && !isDesktop && (_jsx(MobileMenu, { onClick: toggleMobileMenu, isOpen: isOpenMobileMenu })), !isService && isDesktop && (_jsx(SidebarClosed, { onClick: toggleOpen, isOpen: isOpen, isSubMenuOpen: isSubMenuOpen, setSubMenu: setSubMenu, isBusinessSubMenuOpen: isBusinessSubMenuOpen, setBusinessSubMenu: setBusinessSubMenu, toggleSubMenu: toggleSubMenu, toggleBusinessSubMenu: toggleBusinessSubMenu })), _jsx("main", { children: _jsx(Outlet, {}) }), !isService && _jsx(Footer, {}), _jsx(AuthModal, {})] }));
};
export default Layout;
