import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
// Компонент бургерменю
export default function Burger() {
    const { i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsx(_Fragment, { children: _jsxs("div", { style: {
                background: '#242529',
                display: 'flex',
                width: 'calc(100% + 4rem)',
                height: '5rem',
                position: 'fixed',
                bottom: '0',
                justifyContent: 'space-evenly',
                zIndex: '999999999',
                left: '-4rem',
                alignItems: 'center',
            }, children: [_jsx("div", { children: _jsx("a", { href: 'https://instagram.com/erik_eitan2018', target: '_blank', rel: "noreferrer", children: _jsx("img", { src: "/static/sidebar/iconinstagrami111-a5ij.svg", alt: "", className: "sidebar-iconinstagram", style: {
                                transform: 'rotate(270deg)',
                            } }) }) }), _jsx("div", { children: _jsx("a", { href: 'https://youtube.com/', target: '_blank', rel: "noreferrer", children: _jsx("img", { src: "/static/sidebar/iconyoutubei111-z1oe.svg", alt: "", className: "sidebar-iconyoutube", style: {
                                transform: 'rotate(270deg)',
                            } }) }) }), _jsx("div", { children: _jsx("a", { href: 'https://www.facebook.com/profile.php?id=100082843615194&mibextid=LQQJ4d', target: '_blank', rel: "noreferrer", children: _jsx("img", { src: "/static/sidebar/iconfacebooki111-e0b.svg", alt: "", className: "sidebar-iconfacebook", style: {
                                transform: 'rotate(270deg)',
                            } }) }) }), _jsx("div", { children: _jsx("a", { href: 'https://twitter.xn--m-0tbi/', target: '_blank', rel: "noreferrer", children: _jsx("img", { src: "/static/sidebar/icontwitteri111-8tqw.svg", alt: "", className: "sidebar-icontwitterI111", style: {
                                transform: 'rotate(270deg)',
                            } }) }) })] }) }));
}
