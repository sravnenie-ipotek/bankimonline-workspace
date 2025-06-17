import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './NavigationList.module.scss';
const cx = classNames.bind(styles);
const NavigationList = ({ items, title, toggle }) => {
    const { t } = useTranslation();
    return (_jsxs("ul", { className: cx('list'), children: [_jsx("h3", { className: cx('title'), children: t(`${title}`) }), items.slice(0, 1).map((item) => (_jsx("li", { onClick: toggle, className: cx('item'), children: item.title }, item.title))), items.slice(1).map((item) => (_jsx("li", { className: cx('item'), children: _jsx(Link, { to: item.path, children: item.title }) }, item.title)))] }));
};
export default NavigationList;
