import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import '../NotFound.module.scss';
import styles from '../NotFound.module.scss';
const cx = classNames.bind(styles);
const Greeting = ({ type }) => {
    const { t } = useTranslation();
    return (_jsxs("div", { className: cx('notfound-greeting'), children: [type === 'NOT_FOUND' && _jsx("span", { children: t('not_found_greeting') }), type === 'FALLBACK' && _jsx("span", { children: t('not_found_greeting') })] }));
};
export default Greeting;
