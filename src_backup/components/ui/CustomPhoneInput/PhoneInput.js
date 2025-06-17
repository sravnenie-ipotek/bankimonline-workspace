import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css';
import { Error } from '@components/ui/Error';
import { TitleElement } from '../TitleElement';
import styles from './PhoneInput.module.scss';
const cx = classNames.bind(styles);
export function CustomPhoneInput({ title, value, handleChange, error, onBlur, tooltip, }) {
    const id = useId();
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return (_jsxs("div", { className: cx('phone-wrapper'), children: [_jsx(TitleElement, { title: title, tooltip: tooltip }), _jsx(PhoneInput, { enableSearch: true, inputProps: { id }, containerClass: cx('phone-container'), buttonClass: cx('phone-button', { error: error }), inputClass: cx('phone-input', { error: error }), dropdownClass: cx('phone-dropdown', 'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'), searchClass: cx('phone-search'), searchPlaceholder: t('search'), searchNotFound: t('nothing_found'), disableSearchIcon: true, country: 'il', value: value, onBlur: onBlur, onChange: (phone) => handleChange(phone) }), error && _jsx(Error, { error: error })] }));
}
