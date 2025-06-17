import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './SubSidebar.module.scss';
const cx = classNames.bind(styles);
const SubSidebar = ({ items, isOpen, isOpenMainMenu, onCloseMainMenu, }) => {
    return (_jsx("nav", { className: cx('container', {
            container_open: isOpen && isOpenMainMenu,
        }), children: _jsx("ul", { className: cx('list'), children: items.map((item) => (_jsx("li", { className: cx('item'), children: _jsx(Link, { to: item.path, onClick: onCloseMainMenu, children: item.title }) }, item.title))) }) }));
};
export default SubSidebar;
