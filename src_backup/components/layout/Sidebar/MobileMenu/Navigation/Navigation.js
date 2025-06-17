import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import NavigationList from '@components/layout/Sidebar/MobileMenu/Navigation/NavigationList/NavigationList.tsx';
import NavigationSubMenu from '@components/layout/Sidebar/MobileMenu/Navigation/NavigationSubMenu/NavigationSubMenu.tsx';
import { useBusinessMenuItems, useMenuItems, } from '@components/layout/Sidebar/hooks/sidebar.ts';
import { useBusinessSubMenuItems, useSubMenuItems, } from '@components/layout/Sidebar/hooks/subMenu.ts';
import { useToggle } from '@src/hooks/useToggle.ts';
import styles from './Navigation.module.scss';
const cx = classNames.bind(styles);
const Navigation = () => {
    const menuItems = useMenuItems();
    const menuBusinessItems = useBusinessMenuItems();
    const subMenuItems = useSubMenuItems();
    const businessSubMenuItems = useBusinessSubMenuItems();
    const { isOn, toggle } = useToggle(false);
    const { isOn: isOpenBusiness, toggle: toggleBusiness } = useToggle(false);
    return (_jsxs(_Fragment, { children: [_jsxs("nav", { className: cx('nav'), children: [_jsx(NavigationList, { items: menuItems, title: "sidebar_company", toggle: toggle }), _jsx(NavigationList, { items: menuBusinessItems, title: "sidebar_business", toggle: toggleBusiness })] }), _jsx(NavigationSubMenu, { isOpen: isOn, onClose: toggle, items: subMenuItems }), _jsx(NavigationSubMenu, { isOpen: isOpenBusiness, onClose: toggleBusiness, items: businessSubMenuItems })] }));
};
export default Navigation;
