import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Error } from '@components/ui/Error';
import { CancelIcon } from '../../../assets/icons/CancelIcon';
import { CaretDownIcon } from '../../../assets/icons/CaretDownIcon';
import { CaretUpIcon } from '../../../assets/icons/CaretUpIcon';
import { MagnifyingGlassIcon } from '../../../assets/icons/magnifyingGlassIcon';
import styles from './multiselect.module.scss';
const cx = classNames.bind(styles);
const MultiSelect = ({ data, placeholder, onChange, value, searchable, searchPlaceholder, nothingFoundText, searchDescription, onBlur, error, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [checkItem, setCheckItem] = useState([]);
    const wrapperRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            setCheckItem(value || []);
        }
    }, [isOpen, value]);
    const handleClickOutside = useCallback((event) => {
        if (wrapperRef.current &&
            !wrapperRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);
    const handleSelectItem = (item) => {
        setCheckItem((prevCheckItems) => {
            if (prevCheckItems.includes(item)) {
                return prevCheckItems.filter((existingItem) => existingItem !== item);
            }
            else {
                return [...prevCheckItems, item];
            }
        });
    };
    const handleRemoveItem = (itemToRemove, event) => {
        const updatedValue = value?.filter((item) => item !== itemToRemove) || [];
        onChange?.(updatedValue);
        setCheckItem((prevCheckItems) => {
            return prevCheckItems.filter((item) => item !== itemToRemove);
        });
        event.stopPropagation();
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    const filteredOptions = Array.isArray(data)
        ? data.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { ref: wrapperRef, onBlur: onBlur, className: cx('multiselect', `${isOpen && 'focus'}`, `${error && !isOpen && 'error'}`), children: [_jsxs("div", { className: cx('multiselect-wrapper'), onClick: () => setIsOpen(!isOpen), tabIndex: 0, children: [_jsx("div", { className: cx('multiselect-input', 'truncate'), children: value && value.length > 0 ? (value.map((item) => (_jsxs("div", { className: cx('multiselect-input__item'), children: [item, _jsx(CancelIcon, { onClick: (event) => handleRemoveItem(item, event) })] }, item)))) : (_jsx("span", { className: cx('multiselect-placeholder'), children: placeholder })) }), isOpen ? (_jsx(CaretUpIcon, { className: "cursor-pointer", onClick: () => setIsOpen(false) })) : (_jsx(CaretDownIcon, { className: "cursor-pointer", onClick: () => setIsOpen(true) }))] }), isOpen && (_jsxs("div", { className: cx('multiselect-select'), children: [_jsxs("div", { className: cx('multiselect-scroll', 'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'), children: [searchable && (_jsx("div", { className: cx('multiselect-select__search'), children: _jsxs("div", { className: cx('multiselect-select__search-wrapper'), children: [_jsx(MagnifyingGlassIcon, {}), _jsx("input", { tabIndex: 0, className: cx('multiselect-select__search-input'), value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: searchPlaceholder, autoComplete: "off" })] }) })), _jsx("div", { className: cx('multiselect-select__subtitle'), children: searchDescription }), filteredOptions.length > 0 ? (filteredOptions.map((item, index) => (_jsx("div", { tabIndex: 0, className: cx('multiselect-select__item'), onClick: () => handleSelectItem(item), children: _jsxs("div", { className: cx('multiselect-select__item-title'), children: [_jsx("input", { type: "checkbox", id: item, className: cx('checkbox'), checked: checkItem.includes(item), onChange: () => handleSelectItem(item) }), _jsx("label", { htmlFor: item, children: item })] }) }, index)))) : (_jsx("p", { className: cx('multiselect-select__search-no-result'), children: nothingFoundText }))] }), _jsx("div", { className: cx('multiselect-select__button'), children: _jsx("button", { type: "button", className: cx('multiselect-select__button-item'), onClick: () => {
                                        onChange?.(checkItem);
                                        setIsOpen(false);
                                    }, children: t('apply') }) })] }))] }), error && !isOpen && _jsx(Error, { error: error })] }));
};
export default MultiSelect;
