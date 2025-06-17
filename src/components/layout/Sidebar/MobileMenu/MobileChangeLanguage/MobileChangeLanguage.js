import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { CheckIcon } from '@assets/icons/CheckIcon';
import { IsraelFlagIcon } from '@assets/icons/IsraelFlagIcon';
import { RussiaFlagIcon } from '@assets/icons/RussiaFlagIcon';
import Header from '@components/layout/Sidebar/MobileMenu/Header/Header.tsx';
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts';
import { changeLanguage } from '@src/store/slices/languageSlice.ts';
import styles from './MobileChangeLanguage.module.scss';
const cx = classNames.bind(styles);
const MobileChangeLanguage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('ru');
    const wrapperRef = useRef(null);
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const language = useAppSelector((state) => state.language.language);
    const dispatch = useAppDispatch();
    const handleClickOutside = useCallback((event) => {
        if (wrapperRef.current &&
            !wrapperRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    useLayoutEffect(() => {
        if (language) {
            setSelectedLanguage(language);
        }
    }, [language]);
    const data = [
        {
            value: 'ru',
            country: 'Россия',
            language: 'Русский',
            icon: _jsx(RussiaFlagIcon, {}),
        },
        {
            value: 'he',
            country: 'ישראל',
            language: 'עִברִית',
            icon: _jsx(IsraelFlagIcon, {}),
        },
    ];
    // изменение языка
    const handleLanguageChange = async (newLanguage) => {
        try {
            await i18n.changeLanguage(newLanguage);
            setSelectedLanguage(newLanguage);
            dispatch(changeLanguage(newLanguage));
        }
        catch (error) {
            console.error('Error changing language:', error);
        }
    };
    const selectedLanguageData = data.find((item) => item.value === selectedLanguage);
    return (_jsxs("div", { ref: wrapperRef, className: cx('lang'), children: [_jsxs("div", { className: cx('wrapper'), onClick: () => setIsOpen(!isOpen), tabIndex: 0, children: [_jsxs("div", { className: cx('languages'), children: [_jsx("div", { children: selectedLanguageData?.icon }), _jsxs("div", { className: cx('language'), children: [_jsx("span", { className: cx('country'), children: t('country') }), _jsx("span", { className: cx('name'), children: selectedLanguageData?.country })] })] }), _jsx(CaretDownIcon, { className: "cursor-pointer", onClick: () => setIsOpen(false) })] }), _jsxs("div", { className: cx('choose', {
                    choose_open: isOpen,
                }), children: [_jsx(Header, { onClose: () => setIsOpen(false) }), _jsxs("div", { className: cx('select'), children: [_jsx("div", { className: cx('placeholder'), children: _jsx("span", { children: t('sel_cntr') }) }), data.map((item, index) => (_jsxs("div", { tabIndex: 0, className: cx('item'), onClick: () => {
                                    handleLanguageChange(item.value); // Изменение языка при выборе
                                    setIsOpen(false);
                                }, children: [_jsxs("div", { className: cx('languages'), children: [_jsx("div", { children: item?.icon }), _jsxs("div", { className: cx('language'), children: [_jsx("span", { className: cx('country'), children: item?.country }), _jsx("span", { className: cx('name'), children: item?.language })] })] }), selectedLanguage === item.value && _jsx(CheckIcon, {})] }, index)))] })] })] }));
};
export default MobileChangeLanguage;
