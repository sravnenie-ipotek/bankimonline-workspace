import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import Company from './Company/Company.tsx';
import Contacts from './Contacts/Contacts.tsx';
import Documents from './Documents/Documents.tsx';
import InfoBlock from './InfoBlock/InfoBlock.tsx';
import styles from './footer.module.scss';
const cx = classNames.bind(styles);
// Компонент футтера
export default function Footer() {
    const { t } = useTranslation();
    return (_jsx("div", { className: cx('footer'), children: _jsxs("div", { className: cx('wrapper'), children: [_jsxs("div", { className: cx('footer-inner'), children: [_jsx(InfoBlock, {}), _jsxs("div", { className: cx('footer-right'), children: [_jsx(Company, {}), _jsx(Contacts, {}), _jsx(Documents, {})] })] }), _jsx("div", { className: cx('copyright'), children: _jsx("span", { children: t('footer_copyright') }) })] }) }));
}
