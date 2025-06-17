import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from '../NotFound.module.scss';
const cx = classNames.bind(styles);
const Button = () => {
    const { t } = useTranslation();
    return (_jsx(Link, { to: '/', children: _jsx("button", { className: cx(`button-container`), children: _jsx("p", { children: t('not_found_back_home') }) }) }));
};
export default Button;
