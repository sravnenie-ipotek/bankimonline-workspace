import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { useAppSelector } from '@src/hooks/store';
import useDisclosure from '@src/hooks/useDisclosure';
// Компонент блока контактов
import styles from './contacts.module.scss';
const cx = classNames.bind(styles);
export default function Contacts() {
    const { t } = useTranslation();
    const [opened, { open, close }] = useDisclosure(false);
    const windowSize = useAppSelector((state) => state.windowSize.width);
    return (_jsxs(_Fragment, { children: [windowSize > 1024 && (_jsxs("div", { className: cx('contacts'), children: [_jsx("div", { className: cx('contacts-title'), children: t('footer_contacts') }), _jsxs("div", { className: cx('contacts-items'), children: [_jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/envelopesimple.svg" }), _jsx("a", { href: "mailto:Bankimonline@mail.com", target: "_blank", rel: "noreferrer", children: "Bankimonline@mail.com" })] }), _jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/phone.svg" }), _jsx("a", { href: "https://wa.me/972537162235", target: "_blank", rel: "noreferrer", children: "+972 53-716-2235" })] }), _jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/iconwhatsapp.svg" }), _jsx("a", { href: "https://wa.me/972537162235", target: "_blank", rel: "noreferrer", children: t('footer_writeus') })] })] })] })), windowSize <= 1024 && (_jsxs("div", { className: cx('contacts', 'accordion-contacts'), children: [_jsxs("div", { onClick: opened ? close : open, className: cx('contacts-title', 'accordion-title'), children: [t('footer_contacts'), _jsx("div", { className: cx('caret-down', `${opened && 'caret-down-opened'}`), children: _jsx(CaretDownIcon, {}) })] }), _jsxs("div", { className: cx('contacts-items', 'accordion-items', {
                            opened: opened,
                        }), children: [_jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/envelopesimple.svg" }), _jsx("a", { href: "mailto:Bankimonline@mail.com", target: "_blank", rel: "noreferrer", children: "Bankimonline@mail.com" })] }), _jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/phone.svg" }), _jsx("a", { href: "https://wa.me/972537162235", target: "_blank", rel: "noreferrer", children: "+972 53-716-2235" })] }), _jsxs("div", { className: cx('contacts-items__text'), children: [_jsx("img", { alt: "", src: "/static/iconwhatsapp.svg" }), _jsx("a", { href: "https://wa.me/972537162235", target: "_blank", rel: "noreferrer", children: t('footer_writeus') })] })] })] }))] }));
}
