import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import i18next from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../Modal';
import { Tabs } from '../../Tabs';
import styles from './bankInfo.module.scss';
const cx = classNames.bind(styles);
const tabs = [
    {
        value: 'description',
        label: i18next.t('description'),
    },
    {
        value: 'condition',
        label: i18next.t('condition'),
    },
];
const BankInfoModal = ({ isVisible, onClose, title, description, conditionFinance, conditionPeriod, conditionBid, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const [activeTab, setActiveTab] = useState(tabs[0].value);
    const handleChangeTab = (value) => {
        setActiveTab(value);
    };
    return (_jsx(Modal, { isVisible: isVisible, onCancel: onClose, children: _jsxs("div", { className: cx('modal'), children: [_jsxs("div", { className: cx('modal-header'), children: [_jsx("div", { className: cx('modal-header__title'), children: title }), _jsx(Tabs, { handleChange: handleChangeTab, tabs: tabs, tab: activeTab })] }), _jsxs("div", { children: [activeTab === 'description' && (_jsx("div", { className: cx('modal-content'), children: _jsx("p", { className: cx('modal-content__text'), children: description }) })), activeTab === 'condition' && (_jsxs("div", { className: cx('modal-content'), children: [_jsxs("div", { className: cx('modal-content__row'), children: [_jsx("p", { className: cx('modal-content__condition'), children: t('calculate_mortgage_parameters_initial') }), _jsxs("div", { className: cx('modal-content__title'), children: [_jsx("span", { className: cx('ellipse') }), _jsx("p", { children: conditionFinance })] })] }), _jsxs("div", { className: cx('modal-content__row'), children: [_jsx("p", { className: cx('modal-content__condition'), children: t('mortgage_term') }), _jsxs("div", { className: cx('modal-content__title'), children: [_jsx("span", { className: cx('ellipse') }), _jsx("p", { children: conditionPeriod })] })] }), _jsxs("div", { className: cx('modal-content__row'), children: [_jsx("p", { className: cx('modal-content__condition'), children: t('bid') }), _jsx("p", { className: cx('modal-content__title'), children: conditionBid })] })] }))] })] }) }));
};
export default BankInfoModal;
