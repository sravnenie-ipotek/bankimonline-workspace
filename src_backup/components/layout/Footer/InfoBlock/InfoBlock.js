import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import Logo from '../Logo/Logo.tsx';
import Social from '../Social/Social.tsx';
import styles from './infoBlock.module.scss';
const cx = classNames.bind(styles);
// Компонет блока с информацией
export default function InfoBlock() {
    const { i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsxs("div", { className: cx('footer-info'), children: [_jsx(Logo, {}), _jsx(Social, {})] }));
}
