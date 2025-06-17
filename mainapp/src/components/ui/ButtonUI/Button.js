import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@src/hooks/store';
import styles from './button.module.scss';
// которые могут быть переданы в компонент ButtonUI исключая специальный пропс ref.
const cx = classNames.bind(styles); // Создание функции для генерации css-классов на основе заданных стилей
const Button = ({ disabled, type, children, variant = 'primary', size = 'medium', className, to, icon, isDisabled, ...rest }) => {
    const { direction } = useAppSelector((state) => state.language);
    const buttonClasses = {
        [variant]: true,
        [styles.button]: true, // Добавление базового css-класса кнопки
    };
    const buttonInternalClasses = {
        [size]: true, // Добавление css-класса, соответствующего выбранному размеру
    };
    return (_jsx(Link, { to: to, className: styles.link, children: _jsxs("button", { className: cx(buttonClasses, className, { isDisabled: isDisabled }), 
            // дополнительных классов из пропсов
            disabled: disabled, type: type, ...rest, children: [_jsx("p", { className: cx(buttonInternalClasses, styles.internalButton), children: children }), _jsx("div", { className: direction === 'rtl' ? 'rotate-180' : '', children: icon })] }) }));
};
export default Button;
