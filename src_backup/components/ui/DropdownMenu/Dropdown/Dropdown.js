import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CaretDownIcon } from '@assets/icons/CaretDownIcon';
import { CaretUpIcon } from '@assets/icons/CaretUpIcon';
import { CheckIcon } from '@assets/icons/CheckIcon';
import { MagnifyingGlassIcon } from '@assets/icons/magnifyingGlassIcon';
import { Error } from '@components/ui/Error';
import styles from './dropdown.module.scss';
const cx = classNames.bind(styles);
const Dropdown = ({ data, placeholder, onChange, value, searchable, searchPlaceholder, nothingFoundText, onBlur, error, className, ...props }) => {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);
    /**
     * Функция которая обрабатывает клик вне компонента
     * 1. закрывает dropdown если кликнули вне компонента
     */
    const handleClickOutside = useCallback((event) => {
        if (wrapperRef.current &&
            !wrapperRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }, []);
    const handleSelectItem = (item) => {
        onChange?.(item.value);
        setIsOpen(false);
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    const filteredOptions = data.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
    return (_jsxs(_Fragment, { children: [_jsxs("div", { ref: wrapperRef, onBlur: onBlur, className: cx('dropdown', `${isOpen && 'focus'}`, `${error && !isOpen && 'error'}`, className), ...props, children: [_jsxs("div", { className: cx('dropdown-wrapper'), onClick: () => setIsOpen(!isOpen), tabIndex: 0, children: [_jsx("input", { readOnly: true, className: cx('dropdown-input', 'truncate', className), id: id, placeholder: placeholder, value: data.find((item) => item.value === value)?.label || '' }), isOpen ? (_jsx(CaretUpIcon, { className: "cursor-pointer", onClick: () => setIsOpen(false) })) : (_jsx(CaretDownIcon, { className: "cursor-pointer", onClick: () => setIsOpen(true) }))] }), isOpen && (_jsxs("div", { className: cx('dropdown-select', 'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'), children: [searchable && (_jsx("div", { className: cx('dropdown-select__search'), children: _jsxs("div", { className: cx('dropdown-select__search-wrapper'), children: [_jsx(MagnifyingGlassIcon, {}), _jsx("input", { tabIndex: 0, className: cx('dropdown-select__search-input'), value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: searchPlaceholder, autoComplete: "off" })] }) })), filteredOptions.length > 0 ? (filteredOptions.map((item, index) => (_jsxs("div", { tabIndex: 0, className: cx('dropdown-select__item'), onClick: () => handleSelectItem(item), children: [item.label, value === item.value && _jsx(CheckIcon, {})] }, index)))) : (_jsx("p", { className: cx('dropdown-select__search-no-result'), children: nothingFoundText }))] }))] }), error && !isOpen && _jsx(Error, { error: error })] }));
};
export default Dropdown;
