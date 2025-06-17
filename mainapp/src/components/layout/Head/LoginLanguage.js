import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { SignOut } from '@assets/icons/SignOut';
import { Button } from '@components/ui/ButtonUI';
import { ChangeLanguage } from '@src/components/ui/ChangeLanguage';
import { useAppDispatch } from '@src/hooks/store.ts';
import { useWindowResize } from '@src/hooks/useWindowResize.ts';
import { setActiveModal } from '@src/pages/Services/slices/loginSlice.ts';
import { openAuthModal } from '@src/pages/Services/slices/modalSlice.ts';
import './Header.module.scss';
import styles from './Header.module.scss';
const cx = classNames.bind(styles);
export default function LoginLanguage() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const pathMap = location.pathname.split('/');
    const isService = pathMap.includes('services');
    const { isDesktop } = useWindowResize();
    const handleLogin = () => {
        dispatch(openAuthModal());
        dispatch(setActiveModal('auth'));
    };
    return (_jsxs("div", { className: cx('login-language'), children: [isDesktop && (_jsxs(_Fragment, { children: [!isService && _jsx(ChangeLanguage, {}), _jsx("div", { className: cx('w-fit'), children: _jsx(Button, { variant: isService ? 'transparent' : 'primary', style: {
                                flexWrap: 'nowrap',
                                whiteSpace: 'nowrap',
                                width: '230px',
                                height: '54px',
                                padding: '14px 16px',
                                borderRadius: '4px',
                                alignSelf: 'stretch',
                                margin: 0,
                                minWidth: '266px',
                            }, size: "smallLong", onClick: handleLogin, icon: _jsx(SignOut, { color: 'currentColor', size: 24 }), children: t('account') }) })] })), !isDesktop && (_jsx("div", { className: cx('w-fit'), children: _jsx("button", { className: cx(`sign-in_btn--mobile${isService ? '_transparent' : ''}`), onClick: handleLogin, children: _jsx(SignOut, { color: 'currentColor', size: 24 }) }) }))] }));
}
