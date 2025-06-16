import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Error } from '../Error';
import styles from './yesno.module.scss';
const cx = classNames.bind(styles);
const YesNo = ({ value, onChange, error }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cx('wrapper'), children: [_jsx("button", { className: cx('button', { active: value === 'yes' }, { error: error }), type: "button", onClick: () => onChange('yes'), children: t('yes') }), _jsx("button", { className: cx('button', { active: value === 'no' }, { error: error }), type: "button", onClick: () => onChange('no'), children: t('no') })] }), error && _jsx(Error, { error: error })] }));
};
export default YesNo;
