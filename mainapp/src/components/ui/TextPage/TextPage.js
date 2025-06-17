import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
import { Container } from '../Container';
import styles from './textPage.module.scss';
const cx = classNames.bind(styles);
const TextPage = ({ title, text }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    return (_jsx("div", { className: cx('page'), children: _jsx(Container, { children: _jsxs("div", { className: cx('page-container'), children: [_jsxs("div", { className: cx('page-header'), children: [_jsxs("button", { className: cx('button'), onClick: () => navigate(-1), children: [_jsx(CaretRightIcon, { color: "#fff", style: {
                                            transform: i18n.language === 'he' ? 'rotate(0)' : 'rotate(180deg)',
                                        } }), t('back')] }), _jsx("h1", { className: cx('page-header__title'), children: title })] }), _jsx("div", { className: cx('page-text'), children: text })] }) }) }));
};
export default TextPage;
