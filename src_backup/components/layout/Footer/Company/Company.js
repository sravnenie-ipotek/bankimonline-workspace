import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { useAppSelector } from '@src/hooks/store';
import useDisclosure from '@src/hooks/useDisclosure';
// Компонент информации о компании
import styles from './company.module.scss';
const cx = classNames.bind(styles);
const Company = () => {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const windowSize = useAppSelector((state) => state.windowSize.width);
    const navigate = useNavigate();
    return (_jsxs(_Fragment, { children: [windowSize > 1024 && (_jsxs("div", { className: cx('company'), children: [_jsx("div", { className: cx('company-title'), children: t('footer_company') }), _jsxs("div", { className: cx('company-items'), children: [_jsx("a", { className: cx('company-items__text'), children: t('footer_contacts') }), _jsx("a", { onClick: () => navigate('/about'), className: cx('company-items__text'), children: t('footer_about') }), _jsx("a", { className: cx('company-items__text'), children: t('footer_vacancy') }), _jsx("a", { className: cx('company-items__text'), children: t('footer_partner') })] })] })), windowSize <= 1024 && (_jsxs("div", { className: cx('company', 'accordion-company'), children: [_jsxs("div", { onClick: opened ? close : open, className: cx('company-title', 'accordion-title'), children: [t('footer_company'), _jsx("div", { className: cx('caret-down', `${opened && 'caret-down-opened'}`), children: _jsx(CaretDownIcon, {}) })] }), _jsxs("div", { className: cx('company-items', 'accordion-items', {
                            opened: opened,
                        }), children: [_jsx("a", { children: t('footer_about') }), _jsx("a", { children: t('footer_contacts') }), _jsx("a", { children: t('footer_vacancy') }), _jsx("a", { children: t('footer_partner') })] })] }))] }));
};
export default Company;
