import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { ServiceCardIcons } from '@assets/icons/ServiceCardIcons';
import { ServiceCard } from './ServiceCard';
import styles from './topServices.module.scss';
const cx = classNames.bind(styles);
const TopServices = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsxs("div", { className: cx('services'), children: [_jsx(ServiceCard, { to: "/services/calculate-mortgage/1", title: t('calculate_mortgage'), icon: _jsx(ServiceCardIcons, { src: "/static/calculate-mortgage-icon.png" }) }), _jsx(ServiceCard, { to: "/services/refinance-mortgage/1", title: t('mortgage_refinance'), icon: _jsx(ServiceCardIcons, { src: "/static/refinance-mortgage-icon.png" }) }), _jsx(ServiceCard, { to: "/services/calculate-credit/1", title: t('calculate_credit'), icon: _jsx(ServiceCardIcons, { src: "/static/calculate-credit-icon.png" }) }), _jsx(ServiceCard, { to: "/services/refinance-credit/1", title: t('credit_refinance'), icon: _jsx(ServiceCardIcons, { src: "/static/refinance-credit-icon.png" }) })] }));
};
export default TopServices;
