import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { useAppSelector } from '@src/hooks/store';
import useDisclosure from '@src/hooks/useDisclosure';
import styles from './documents.module.scss';
const cx = classNames.bind(styles);
export default function Documents() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const windowSize = useAppSelector((state) => state.windowSize.width);
    const navigate = useNavigate();
    return (_jsxs(_Fragment, { children: [windowSize > 1024 && (_jsxs("div", { className: cx('documents'), children: [_jsx("div", { className: cx('documents-title'), children: t('footer_legal') }), _jsxs("div", { className: cx('documents-items'), children: [_jsx("a", { onClick: () => navigate('/terms'), className: cx('documents-items__links'), children: t('footer_legal_1') }), _jsx("a", { onClick: () => navigate('/privacy-policy'), className: cx('documents-items__links'), children: t('footer_legal_2') }), _jsx("a", { onClick: () => navigate('/cookie'), className: cx('documents-items__links'), children: t('footer_legal_3') }), _jsx("a", { onClick: () => navigate('/refund'), className: cx('documents-items__links'), children: t('footer_legal_4') })] })] })), windowSize <= 1024 && (_jsxs("div", { className: cx('documents', 'accordion-documents'), children: [_jsxs("div", { onClick: opened ? close : open, className: cx('documents-title', 'accordion-title'), children: [t('footer_legal'), _jsx("div", { className: cx('caret-down', `${opened && 'caret-down-opened'}`), children: _jsx(CaretDownIcon, {}) })] }), _jsxs("div", { className: cx('documents-items', 'accordion-items', {
                            opened: opened,
                        }), children: [_jsx("a", { href: "/terms", children: t('footer_legal_1') }), _jsx("a", { children: t('footer_legal_2') }), _jsx("a", { children: t('footer_legal_3') }), _jsx("a", { children: t('footer_legal_4') })] })] }))] }));
}
