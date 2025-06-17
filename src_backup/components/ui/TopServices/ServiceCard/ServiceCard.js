import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
import { useWindowResize } from '@src/hooks/useWindowResize';
import styles from './serviceCard.module.scss';
const cx = classNames.bind(styles);
const ServiceCard = ({ title, to, icon }) => {
    const { isDesktop, isTablet, isMobile } = useWindowResize();
    return (_jsxs(Link, { to: to, children: [isDesktop && (_jsxs("div", { className: cx('service-card'), children: [_jsx("div", { className: cx('service-card__title'), children: title }), _jsx("div", { className: cx('service-card__icon'), children: icon })] })), isTablet && (_jsxs("div", { className: cx('service-card'), children: [_jsxs("div", { className: cx('service-card__tablet'), children: [_jsx("div", { className: cx('service-card__tablet-icon'), children: icon }), _jsx("div", { className: cx('service-card__tablet-title'), children: title })] }), _jsx("div", { className: cx('service-card__icon'), children: _jsx(CaretRightIcon, { color: "#fff" }) })] })), isMobile && (_jsxs("div", { className: cx('service-card'), children: [_jsxs("div", { className: cx('service-card__tablet'), children: [_jsx("div", { className: cx('service-card__tablet-icon'), children: icon }), _jsx("div", { className: cx('service-card__tablet-title'), children: title })] }), _jsx("div", { className: cx('service-card__icon'), children: _jsx(CaretRightIcon, { color: "#fff" }) })] }))] }));
};
export default ServiceCard;
