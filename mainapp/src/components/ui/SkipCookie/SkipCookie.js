import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/ButtonUI';
import styles from './skipCookie.module.scss';
const cx = classNames.bind(styles);
const SkipCookie = () => {
    const { t } = useTranslation();
    const [isCookieVisible, setCookieVisible] = useState(false);
    // при загрузке проверяет соглашен ли пользователь с куками
    useEffect(() => {
        const cookieValue = localStorage.getItem('cookie');
        console.log(cookieValue);
        if (cookieValue === '1') {
            setCookieVisible(false);
        }
        else {
            setCookieVisible(true);
        }
    }, []);
    // скрывает уведомление о куках
    const handleSkipCookie = () => {
        setCookieVisible(false);
    };
    // соглашается с куками
    const handleCookie = () => {
        setCookieVisible(false);
        localStorage.setItem('cookie', '1');
    };
    if (!isCookieVisible) {
        return null;
    }
    const cookieElement = (_jsx("div", { className: cx('cookie-holder'), children: _jsxs("div", { className: cx('cookie'), children: [_jsx("img", { src: "/static/cookie.svg", width: "52", height: "52", alt: "" }), _jsx("span", { className: cx('cookie-text'), children: t('cookie') }), _jsx("span", { className: cx('accept_btn'), children: _jsx(Button, { variant: 'primary', size: 'medium', className: cx('cookie_accept'), onClick: handleCookie, children: t('accept_cookie') }) }), _jsx("span", { children: _jsx("img", { src: "/static/x.svg", width: "32", height: "32", className: cx('cookie-close'), style: { cursor: 'pointer' }, onClick: handleSkipCookie, alt: "" }) })] }) }));
    return ReactDOM.createPortal(cookieElement, document.body);
};
export default SkipCookie;
