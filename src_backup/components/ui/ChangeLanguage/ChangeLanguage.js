import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { CaretUpIcon } from '@assets/icons/CaretUpIcon';
import { CheckIcon } from '@assets/icons/CheckIcon';
import { IsraelFlagIcon } from '@assets/icons/IsraelFlagIcon';
import { RussiaFlagIcon } from '@assets/icons/RussiaFlagIcon';
import { useAppDispatch, useAppSelector } from '@src/hooks/store';
import { changeLanguage } from '@src/store/slices/languageSlice';
import Divider from '../Divider/Divider';
import styles from './changeLanguage.module.scss';
const cx = classNames.bind(styles);
const ChangeLanguage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('ru');
    const wrapperRef = useRef(null);
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const language = useAppSelector((state) => state.language.language);
    useLayoutEffect(() => {
        if (language) {
            setSelectedLanguage(language);
        }
    }, [language]);
    const dispatch = useAppDispatch();
    // закрывает меню при нажатии за пределами
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
    return (_jsx(_Fragment, { children: _jsxs("div", { ref: wrapperRef, className: cx('language'), children: [_jsxs("div", { className: cx('language-wrapper'), onClick: () => setIsOpen(!isOpen), tabIndex: 0, children: [_jsxs("div", { className: cx('language-input'), children: [_jsx("div", { children: selectedLanguageData?.icon }), _jsxs("div", { className: cx('language-input__text'), children: [_jsx("span", { className: cx('language-input__text-country'), children: t('country') }), _jsx("span", { className: cx('language-input__text-name'), children: selectedLanguageData?.country })] })] }), isOpen ? (_jsx(CaretUpIcon, { className: "cursor-pointer", onClick: () => setIsOpen(false) })) : (_jsx(CaretDownIcon, { className: "cursor-pointer", onClick: () => setIsOpen(true) }))] }), isOpen && (_jsxs("div", { className: cx('language-select', 'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'), children: [_jsx("div", { className: cx('language-select__title'), children: _jsx("span", { children: t('sel_cntr') }) }), _jsx(Divider, {}), data.map((item, index) => (_jsxs("div", { tabIndex: 0, className: cx('language-select__item'), onClick: () => {
                                handleLanguageChange(item.value); // Изменение языка при выборе
                                setIsOpen(false);
                            }, children: [_jsxs("div", { className: cx('language-select__wrapper'), children: [_jsx("div", { children: item?.icon }), _jsxs("div", { className: cx('language-select__text'), children: [_jsx("span", { className: cx('language-select__text-name'), children: item?.country }), _jsx("span", { className: cx('language-select__text-lang'), children: item?.language })] })] }), selectedLanguage === item.value && _jsx(CheckIcon, {})] }, index)))] }))] }) }));
};
export default ChangeLanguage;
