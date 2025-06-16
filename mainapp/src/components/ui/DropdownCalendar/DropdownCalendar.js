import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
import styles from './dropdownCalendar.module.scss';
const cx = classNames.bind(styles);
const DropdownCalendar = ({ data, onChange, value }) => {
    const id = useId();
    const [isOpen, setIsOpen] = useState(false);
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
        onChange?.(item);
        setIsOpen(false);
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);
    return (_jsx(_Fragment, { children: _jsxs("div", { ref: wrapperRef, className: cx('dropdown'), onClick: () => setIsOpen(!isOpen), tabIndex: 0, children: [_jsxs("div", { className: cx('dropdown-wrapper'), children: [_jsx("input", { readOnly: true, className: cx('dropdown-input', 'truncate'), id: id, value: value }), isOpen ? (_jsx(CaretRightIcon, { size: 16, color: "#fff", onClick: () => setIsOpen(false), style: { transform: 'rotate(90deg)' } })) : (_jsx(CaretRightIcon, { size: 16, color: "#fff", onClick: () => setIsOpen(false), style: { transform: 'rotate(-90deg)' } }))] }), isOpen && (_jsx("div", { className: cx('dropdown-select', 'scrollbar scrollbar-thumb-base-primaryDisabledButton scrollbar-thumb-rounded-md scrollbar-w-1'), children: data.map((item, index) => (_jsx("div", { tabIndex: 0, className: cx('dropdown-select__item', {
                            selected: value === item,
                        }), onClick: () => handleSelectItem(item), children: item }, index))) }))] }) }));
};
export default DropdownCalendar;
