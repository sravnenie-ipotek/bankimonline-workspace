import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { PensilSimple } from '@assets/icons/PencilSimple';
import { Column } from '@components/ui/Column';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';
import styles from './personalProfile.module.scss';
const cx = classNames.bind(styles);
const PersonalProfile = ({ name, phone }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    return (_jsx(Column, { children: _jsxs("div", { className: cx('profile'), children: [_jsxs("div", { className: cx('profile-title'), children: [_jsx("p", { className: cx('profile-title__text'), children: t('calculate_mortgage_profile_title') }), _jsx(PensilSimple, { onClick: () => navigate('/services/calculate-mortgage/2'), className: cx('profile-title__icon') })] }), _jsxs("div", { className: cx('profile-data'), children: [_jsx("div", { className: cx('profile-data__name'), children: name }), _jsx("div", { className: cx('profile-data__phone'), children: phone && formatPhoneNumber(phone, i18n.language) })] })] }) }));
};
export default PersonalProfile;
