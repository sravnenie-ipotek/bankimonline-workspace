import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import { useLocation } from 'react-router';
import LoginLanguage from '@components/layout/Head/LoginLanguage.tsx';
import Logo from '@components/layout/Head/Logo.tsx';
import { Container } from '@components/ui/Container';
import styles from './Header.module.scss';
const cx = classnames.bind(styles);
const Header = ({ onOpenMobileMenu, isMobile }) => {
    const location = useLocation();
    const pathMap = location.pathname.split('/');
    const isService = pathMap.includes('services');
    return (_jsx("div", { style: { width: '100%', borderBottom: '1px solid #333535' }, children: _jsx(Container, { style: {
                display: 'flex',
                height: '94px',
                alignItems: 'center',
                maxWidth: 'auto',
            }, children: _jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '70.63rem',
                    margin: '0 auto',
                    padding: 0,
                }, children: [_jsx(Logo, {}), _jsxs("div", { className: cx('bottom'), children: [_jsx(LoginLanguage, {}), !isMobile && !isService && (_jsx("button", { type: "button", onClick: () => {
                                    onOpenMobileMenu?.();
                                    console.log('click');
                                }, className: cx('burger'), children: _jsx("span", { children: '' }) }))] })] }) }) }));
};
export default Header;
