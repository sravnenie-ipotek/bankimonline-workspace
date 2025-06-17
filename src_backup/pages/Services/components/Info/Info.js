import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { ShieldCheckIcon } from '@assets/icons/ShieldCheckIcon';
import styles from './info.module.scss';
const cx = classNames.bind(styles);
const Info = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return (_jsxs("div", { className: cx('info'), children: [_jsx("div", { children: _jsx(ShieldCheckIcon, { size: 24 }) }), _jsx("span", { className: cx('info-title'), children: t('third_persons') })] }));
};
export default Info;
