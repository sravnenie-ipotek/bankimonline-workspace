import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
// Компонент кнопки
const Button = ({ name, title, handleClick }) => {
    const { i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsx("span", { className: name + ' ' + ' noselect button button-' + i18n.language, onClick: handleClick, children: _jsx("div", { className: 'button-inner', children: _jsx("div", { className: 'button-inner-title', children: title }) }) }));
};
export default Button;
