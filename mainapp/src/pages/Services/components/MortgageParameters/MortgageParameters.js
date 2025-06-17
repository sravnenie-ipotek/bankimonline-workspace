import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SliderHorizontalIcon } from '@assets/icons/SlidersHorizontalIcon';
import { Column } from '@components/ui/Column';
import styles from './mortgageParameters.module.scss';
const cx = classNames.bind(styles);
const MortgageParameters = ({ cost, initialPayment, period, credit, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const navigate = useNavigate();
    const formattedCost = cost?.toLocaleString('en-US');
    const formattedInitialPayment = initialPayment?.toLocaleString('en-US');
    const formattedCredit = credit?.toLocaleString('en-US');
    const formattedPeriod = period && period * 12;
    return (_jsx(Column, { children: _jsxs("div", { className: cx('parameters'), children: [_jsxs("div", { className: cx('parameters-title'), children: [_jsx("p", { className: cx('parameters-title__text'), children: t('calculate_mortgage_parameters') }), _jsx(SliderHorizontalIcon, { onClick: () => navigate('/services/calculate-mortgage/1'), className: cx('parameters-title__icon') })] }), _jsxs("div", { className: cx('wrapper'), children: [formattedCredit && (_jsxs("div", { className: cx('parameters-data'), children: [_jsxs("div", { className: cx('parameters-data__title'), children: [formattedCredit, " \u20AA"] }), _jsx("div", { className: cx('parameters-data__desc'), children: t('sum_credit') })] })), formattedCost && (_jsxs("div", { className: cx('parameters-data'), children: [_jsxs("div", { className: cx('parameters-data__title'), children: [formattedCost, " \u20AA"] }), _jsx("div", { className: cx('parameters-data__desc'), children: t('calculate_mortgage_parameters_cost') })] })), formattedInitialPayment && (_jsxs("div", { className: cx('parameters-data'), children: [_jsxs("div", { className: cx('parameters-data__title'), children: [formattedInitialPayment, " \u20AA"] }), _jsx("div", { className: cx('parameters-data__desc'), children: t('calculate_mortgage_parameters_initial') })] }))] }), formattedPeriod && (_jsx("div", { className: cx('wrapper'), children: _jsxs("div", { className: cx('parameters-data'), children: [_jsxs("div", { className: cx('parameters-data__title'), children: [formattedPeriod, " ", t('calculate_mortgage_parameters_months')] }), _jsx("div", { className: cx('parameters-data__desc'), children: t('calculate_mortgage_parameters_period') })] }) }))] }) }));
};
export default MortgageParameters;
