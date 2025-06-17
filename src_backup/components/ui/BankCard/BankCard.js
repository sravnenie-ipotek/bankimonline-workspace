import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@src/hooks/store';
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice';
import { setActiveModal } from '@src/pages/Services/slices/loginSlice';
import { openAuthModal } from '@src/pages/Services/slices/modalSlice';
import { Divider } from '../Divider';
import { Info } from '../Info';
import styles from './bankCard.module.scss';
const cx = classNames.bind(styles);
const BankCard = ({ title, infoTitle, children, mortgageAmount, totalAmount, mothlyPayment, bankOffer, onBankSelect, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const dispatch = useAppDispatch();
    const formattedMortgageAmount = mortgageAmount.toLocaleString('en-US');
    const formattedTotalAmount = totalAmount.toLocaleString('en-US');
    const formattedMonthlyPayment = mothlyPayment.toLocaleString('en-US');
    const handleBankSelection = () => {
        // Create bank offer data if not provided
        const selectedBankOffer = bankOffer || {
            id: `bank_${Date.now()}`,
            bankName: title,
            program: infoTitle,
            rate: 0,
            monthlyPayment: mothlyPayment,
            totalAmount: totalAmount,
            mortgageAmount: mortgageAmount
        };
        // Save selected bank to Redux state
        dispatch(updateMortgageData({
            selectedBank: selectedBankOffer,
            selectedBankId: selectedBankOffer.id,
            selectedBankName: selectedBankOffer.bankName
        }));
        // Call external handler if provided
        if (onBankSelect) {
            onBankSelect(selectedBankOffer);
        }
        // Show registration modal according to documentation flow
        dispatch(setActiveModal('signUp'));
        dispatch(openAuthModal());
        console.log(`[BANK SELECTION] Selected bank: ${selectedBankOffer.bankName}`);
        console.log(`[BANK SELECTION] Bank data:`, selectedBankOffer);
    };
    return (_jsxs("div", { className: cx('card'), children: [_jsxs("div", { className: cx('card-title'), children: [_jsx("h3", { className: cx('card-title__text'), children: title }), _jsx(Info, { title: infoTitle })] }), _jsx("div", { className: cx('card-children'), children: children }), _jsx(Divider, {}), _jsxs("div", { className: cx('card-footer'), children: [_jsxs("div", { className: cx('card-check'), children: [_jsx("p", { className: cx('card-check__title'), children: t('mortgage_total') }), _jsxs("p", { className: cx('card-check__price'), children: [formattedMortgageAmount, " \u20AA"] })] }), _jsxs("div", { className: cx('card-check'), children: [_jsx("p", { className: cx('card-check__title'), children: t('mortgage_total_return') }), _jsxs("p", { className: cx('card-check__price'), children: [formattedTotalAmount, " \u20AA"] })] }), _jsxs("div", { className: cx('card-check'), children: [_jsx("p", { className: cx('card-check__title'), children: t('mortgage_monthly') }), _jsxs("p", { className: cx('card-check__price'), children: [formattedMonthlyPayment, " \u20AA"] })] })] }), _jsx("button", { type: "button", className: cx('card-button'), onClick: handleBankSelection, children: t('mortgage_select_bank') })] }));
};
export default BankCard;
