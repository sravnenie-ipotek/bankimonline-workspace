import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { getMonth, getYear } from 'date-fns';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from '@assets/icons/CalendarIcon';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
import { TitleElement } from '@src/components/ui/TitleElement';
import useTheme from '@src/hooks/useTheme';
import { DropdownCalendar } from '../DropdownCalendar';
// Импорт компонента Title
import styles from './calendar.module.scss';
const cx = classNames.bind(styles);
// Компонент календаря
const Calendar = ({ title, style, value, onChange, placeholder, error, onBlur, isMaxAge, }) => {
    const { t, i18n } = useTranslation(); // Использование i18next для мультиязычности
    const [isCalendarOpen, setCalendarOpen] = useState(false);
    const { colors } = useTheme();
    // Установка текущего языка приложения
    i18n.language = i18n.language.split('-')[0];
    // Функция для создания списка годов
    function range(startYear, currentYear) {
        const years = [];
        while (startYear <= currentYear) {
            years.push(startYear++);
        }
        return years;
    }
    const handleDateChange = (date) => {
        const unixTimestamp = date ? date.getTime() : null;
        onChange(unixTimestamp);
    };
    const handleDateOpen = () => {
        setCalendarOpen((prev) => !prev);
    };
    const handleContainerClick = (e) => {
        // Only toggle if clicking on the input area, not on the calendar popup
        if (!isCalendarOpen) {
            handleDateOpen();
        }
    };
    // Создание списка годов для выбора
    const years = range(getYear(new Date().setMonth(new Date().getMonth() - 1200)), isMaxAge
        ? getYear(new Date().setMonth(new Date().getMonth() - 18 * 12))
        : getYear(new Date()));
    // Создание списка месяцев для выбора
    const months = [
        t('january'),
        t('february'),
        t('march'),
        t('april'),
        t('may'),
        t('june'),
        t('july'),
        t('august'),
        t('september'),
        t('october'),
        t('november'),
        t('december'),
    ];
    return (_jsxs(_Fragment, { children: [_jsx(TitleElement, { title: title }), _jsxs("div", { onClick: handleContainerClick, style: style, className: cx(`${error && 'error'}`, 'calendar', {
                    highlighted: isCalendarOpen,
                }), children: [_jsx(DatePicker, { maxDate: isMaxAge
                            ? new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                            : new Date(), placeholderText: placeholder, open: isCalendarOpen, onClickOutside: () => setCalendarOpen(false), dateFormat: 'dd / MM / yyyy', formatWeekDay: (date) => date.substring(0, 1), weekDayClassName: (date) => {
                            const today = new Date().getDay();
                            return date.getDay() === today ? cx('current-day') : cx('other-day');
                        }, dayClassName: () => cx('day'), showPopperArrow: false, onBlur: onBlur, popperClassName: cx(`${i18n.language === 'he' && 'popper-he'}`), renderCustomHeader: ({ date, changeYear, changeMonth, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled, }) => (
                        // Определение пользовательского заголовка календаря
                        _jsxs("div", { style: {
                                margin: 10,
                                display: 'flex',
                                justifyContent: 'space-between',
                            }, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        decreaseMonth();
                                    }, disabled: prevMonthButtonDisabled, className: cx(`button-style`), type: "button", style: {
                                        transform: i18n.language === 'he' ? 'rotate(180deg)' : '',
                                    }, children: _jsx(CaretRightIcon, { size: 16, color: colors.textTheme.primary, style: { transform: 'scale(-1, 1)' } }) }), _jsx("div", { onClick: (e) => e.stopPropagation(), children: _jsx(DropdownCalendar, { data: months, onChange: (value) => changeMonth(months.indexOf(String(value))), value: months[getMonth(date)] }) }), _jsx("div", { onClick: (e) => e.stopPropagation(), children: _jsx(DropdownCalendar, { data: years, onChange: (value) => changeYear(Number(value)), value: getYear(date) }) }), _jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        increaseMonth();
                                    }, disabled: nextMonthButtonDisabled, className: cx(`button-style`), type: "button", style: {
                                        transform: i18n.language === 'he' ? 'rotate(180deg)' : '',
                                    }, children: _jsx(CaretRightIcon, { size: 16, color: colors.textTheme.primary }) })] })), selected: value ? new Date(value) : null, onChange: handleDateChange }), _jsx(CalendarIcon, {})] })] }));
};
export default Calendar; // Экспорт компонента Calendar
