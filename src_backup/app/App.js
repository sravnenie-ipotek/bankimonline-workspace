import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog } from '@components/layout/Dialog/Dialog';
import { ErrorBoundary } from '@src/app/Errors/ErrorBoundary';
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts';
import { updateWindowSize } from '@src/store/slices/windowSizeSlice.ts';
import { debounce } from '../utils/helpers/debounce.ts';
import './App.css';
import styles from './app.module.scss';
const cx = classNames.bind(styles);
const MainRoutes = lazy(() => import('./AppRoutes').then((module) => ({
    default: module.MainRoutes,
})));
const App = () => {
    const { currentFont, direction, language } = useAppSelector((state) => state.language);
    const { i18n } = useTranslation();
    useEffect(() => {
        /*
          Проверка - авторизован ли пользователь
        */
        // const token = localStorage.getItem('ACCESS_TOKEN')
        // if (!token) {
        //   window.location.href = 'https://dev2.bankimonline.com'
        // }
        i18n.changeLanguage(language);
        document.documentElement.setAttribute('dir', direction);
        document.documentElement.setAttribute('lang', language);
    }, [language]);
    const dispatch = useAppDispatch();
    useEffect(() => {
        const handleResize = debounce(() => {
            dispatch(updateWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            }));
        });
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);
    return (_jsx("section", { className: cx(`${currentFont} ${direction}`, 'app'), dir: direction, children: _jsxs(ErrorBoundary, { children: [_jsx(MainRoutes, {}), _jsx(Dialog, {})] }) }));
};
export default App;
