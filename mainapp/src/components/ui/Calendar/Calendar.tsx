import classNames from 'classnames/bind'
import { getMonth, getYear } from 'date-fns'
import { FormikErrors } from 'formik'
import React, { CSSProperties, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTranslation } from 'react-i18next'

import { CalendarIcon } from '@assets/icons/CalendarIcon'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { TitleElement } from '@src/components/ui/TitleElement'
import { Error } from '@src/components/ui/Error'
import useTheme from '@src/hooks/useTheme'

import { DropdownCalendar } from '../DropdownCalendar'
// Импорт компонента Title
import styles from './calendar.module.scss'

// Импорт стилей

type PropTypes = {
  title?: string // Заголовок календаря
  style?: CSSProperties // Дополнительные стили для компонента
  value: string // Значение выбранной даты
  onChange: (date: string | null) => void // Функция для изменения выбранной даты
  placeholder: string // Плейсхолдер
  onBlur?: () => void
  error?: FormikErrors<Date>
  isMaxAge?: boolean
  allowFuture?: boolean
  blockPastDates?: boolean // Блокировать выбор прошедших дат
  isCreditDate?: boolean // Для кредитных дат - ограничить диапазон до 30 лет
}

const cx = classNames.bind(styles)

// Компонент календаря
const Calendar: React.FC<PropTypes> = ({
  title,
  style,
  value,
  onChange,
  placeholder,
  error,
  onBlur,
  isMaxAge,
  allowFuture,
  blockPastDates,
  isCreditDate,
}) => {
  const { t, i18n } = useTranslation() // Использование i18next для мультиязычности
  const [isCalendarOpen, setCalendarOpen] = useState(false)
  const { colors } = useTheme()

  // Установка текущего языка приложения

  // Функция для создания списка годов в убывающем порядке
  function rangeDesc(startYear: number, currentYear: number): number[] {
    const years = []
    while (currentYear >= startYear) {
      years.push(currentYear--)
    }
    return years
  }

  const handleDateChange = (date: Date | null) => {
    const dateString = date ? date.toISOString().split('T')[0] : null
    onChange(dateString)
    // Auto-close calendar when date is selected
    setCalendarOpen(false)
  }

  const handleDateOpen = () => {
    setCalendarOpen((prev) => !prev)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only toggle if clicking on the input area, not on the calendar popup
    if (!isCalendarOpen) {
      handleDateOpen()
    }
  }

  // Создание списка годов для выбора в убывающем порядке, начиная с текущего года
  const currentYear = getYear(new Date())
  const years = rangeDesc(
    isCreditDate
      ? getYear(new Date().setMonth(new Date().getMonth() - 30 * 12)) // 30 лет назад для кредитов
      : getYear(new Date().setMonth(new Date().getMonth() - 1200)), // 100 лет назад по умолчанию
    isMaxAge
      ? getYear(new Date().setMonth(new Date().getMonth() - 18 * 12))
      : allowFuture
      ? currentYear + 50 // Добавляем 50 лет в будущее для выбора дат окончания кредитов
      : currentYear
  )

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
  ]

  return (
    <>
      {/* Отображение заголовка календаря */}
      <TitleElement title={title} />
      <div
        onClick={handleContainerClick}
        style={style}
        className={cx(`${error && 'error'}`, 'calendar', {
          highlighted: isCalendarOpen,
        })}
      >
        {/* Использование библиотеки react-datepicker для отображения календаря */}
        <DatePicker
          minDate={blockPastDates ? new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
          maxDate={
            isMaxAge
              ? new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              : allowFuture
              ? new Date(new Date().setFullYear(new Date().getFullYear() + 50))
              : new Date()
          }
          placeholderText={placeholder}
          open={isCalendarOpen}
          onClickOutside={() => setCalendarOpen(false)}
          dateFormat={'dd / MM / yyyy'}
          formatWeekDay={(date) => date.substring(0, 1)}
          weekDayClassName={(date) => {
            const today = new Date().getDay()

            return date.getDay() === today ? cx('current-day') : cx('other-day')
          }}
          dayClassName={() => cx('day')}
          showPopperArrow={false}
          onBlur={onBlur}
          popperClassName={cx(`${i18n.language === 'he' && 'popper-he'}`)}
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className={cx('custom-header')}>
              {/* Выпадающий список для выбора года */}
              <DropdownCalendar
                value={getYear(date)}
                data={years}
                onChange={changeYear}
              />

              {/* Выпадающий список для выбора месяца */}
              <DropdownCalendar
                value={months[getMonth(date)]}
                data={months}
                onChange={(monthName) => {
                  const monthIndex = months.indexOf(monthName)
                  changeMonth(monthIndex)
                }}
              />

              {/* Кнопка для переключения на предыдущий месяц */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  decreaseMonth()
                }}
                disabled={prevMonthButtonDisabled}
                className={cx(`button-style`)}
                type="button"
                style={{
                  transform: i18n.language === 'he' ? 'rotate(180deg)' : '',
                }}
              >
                <CaretRightIcon size={16} color={colors.textTheme.primary} />
              </button>

              {/* Кнопка для переключения на следующий месяц */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  increaseMonth()
                }}
                disabled={nextMonthButtonDisabled}
                className={cx(`button-style`)}
                type="button"
                style={{
                  transform: i18n.language === 'he' ? 'rotate(180deg)' : '',
                }}
              >
                <CaretRightIcon size={16} color={colors.textTheme.primary} />
              </button>
            </div>
          )}
          selected={value ? new Date(value) : null} // Установка выбранной даты
          onChange={handleDateChange} // Обработчик изменения выбранной даты
        />

        {/* Иконка календаря */}
        <CalendarIcon />
      </div>
      {error && !isCalendarOpen && <Error error={error} />}
    </>
  )
}

export default Calendar // Экспорт компонента Calendar
