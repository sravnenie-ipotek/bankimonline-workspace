import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SocialMedia from '@components/layout/Sidebar/SocialMedia/SocialMedia.tsx';
import SubSidebar from '@components/layout/Sidebar/SubSidebar/SubSidebar.tsx';
import { useBusinessMenuItems, useMenuItems, } from '@components/layout/Sidebar/hooks/sidebar.ts';
import { useBusinessSubMenuItems, useSubMenuItems, } from '@components/layout/Sidebar/hooks/subMenu.ts';
import styles from './sidebarClose.module.scss';
const cx = classNames.bind(styles);
const SidebarClosed = ({ onClick, isOpen, isSubMenuOpen, setBusinessSubMenu, setSubMenu, isBusinessSubMenuOpen, toggleBusinessSubMenu, toggleSubMenu, }) => {
    const menuItems = useMenuItems();
    const menuBusinessItems = useBusinessMenuItems();
    const { t } = useTranslation();
    const subMenuItems = useSubMenuItems();
    const businessSubMenuItems = useBusinessSubMenuItems();
    const isSubMenusOpen = isSubMenuOpen || isBusinessSubMenuOpen;
    const handleCloseMenus = () => {
        onClick();
        setSubMenu?.(false);
        setBusinessSubMenu?.(false);
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: cx('nav_container', { nav_container_expanded: isOpen }), children: [_jsx("div", { className: cx('whiteLine') }), !isSubMenusOpen && (_jsx("div", { className: cx('box', { box_expanded: isOpen }), onClick: handleCloseMenus, children: _jsxs("button", { type: "button", className: cx('burger_icon', {
                            burger_icon_open: isOpen,
                        }), children: ['', _jsx("span", {})] }) })), _jsx("nav", { children: _jsxs("section", { className: cx('nav_wrapper'), children: [_jsxs("ul", { className: cx('nav_inner'), children: [_jsx("h3", { className: cx('title'), children: t('sidebar_company') }), menuItems.slice(0, 1).map((item) => (_jsx("li", { onClick: () => {
                                            toggleSubMenu?.();
                                            setBusinessSubMenu?.(false);
                                        }, className: cx('menu_item'), children: item.title }, item.title))), menuItems.slice(1).map((item) => (_jsx("li", { className: cx('menu_item'), children: _jsx(Link, { to: item.path, onClick: handleCloseMenus, children: item.title }) }, item.title)))] }), _jsxs("ul", { className: cx('nav_inner'), children: [_jsx("h3", { className: cx('title'), children: t('sidebar_business') }), menuBusinessItems.slice(0, 1).map((item) => (_jsx("li", { onClick: () => {
                                            setSubMenu?.(false);
                                            toggleBusinessSubMenu?.();
                                        }, className: cx('menu_item'), children: item.title }, item.title))), menuBusinessItems.slice(1).map((item) => (_jsx("li", { className: cx('menu_item'), children: _jsx(Link, { to: item.path, onClick: handleCloseMenus, children: item.title }) }, item.title)))] })] }) }), _jsx(SubSidebar, { items: subMenuItems, isOpen: isSubMenuOpen, isOpenMainMenu: isOpen, onCloseMainMenu: onClick }), _jsx(SubSidebar, { items: businessSubMenuItems, isOpen: isBusinessSubMenuOpen, isOpenMainMenu: isOpen, onCloseMainMenu: onClick }), _jsx(SocialMedia, {})] }) }));
};
export default SidebarClosed;
