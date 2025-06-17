import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '@assets/icons/DeleteIcon';
import { AddButton } from '@src/components/ui/AddButton';
import { Calendar } from '@src/components/ui/Calendar';
import { Column } from '@src/components/ui/Column';
import Divider from '@src/components/ui/Divider/Divider';
import { DropdownMenu } from '@src/components/ui/DropdownMenu';
import { ExitModule } from '@src/components/ui/ExitModule';
import { FormattedInput } from '@src/components/ui/FormattedInput';
import { Row } from '@src/components/ui/Row';
import useDisclosure from '@src/hooks/useDisclosure';
import { useWindowResize } from '@src/hooks/useWindowResize';
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts';
import styles from './creditData.module.scss';
const cx = classNames.bind(styles);
const CreditData = () => {
    const [creditData, setCreditData] = useState([]);
    const [idToDelete, setIdToDelete] = useState(null);
    const { values, setFieldValue } = useFormikContext();
    const [opened, { open, close }] = useDisclosure(false);
    const { isDesktop, isTablet, isMobile } = useWindowResize();
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    useEffect(() => {
        setCreditData(values.creditData);
    }, [values.creditData]);
    const addCreditData = () => {
        const newId = generateNewId(creditData);
        const newData = {
            id: newId,
            bank: '',
            amount: null,
            monthlyPayment: null,
            startDate: '',
            endDate: '',
            earlyRepayment: null,
        };
        setFieldValue('creditData', [...creditData, newData]);
    };
    const openModalWithId = (id) => {
        setIdToDelete(id);
        open();
    };
    const removeCreditData = () => {
        if (idToDelete !== null) {
            const filteredData = creditData.filter((item) => item.id !== idToDelete);
            setFieldValue('creditData', filteredData);
        }
        close();
    };
    const data = [
        { value: 'hapoalim', label: 'Bank Hapoalim' },
        { value: 'leumi', label: 'Leumi Bank' },
        { value: 'discount', label: 'Discount Bank' },
        { value: 'massad', label: 'Massad Bank' },
        { value: 'israel', label: 'Bank of Israel' },
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cx('mortgage-data'), children: [_jsx("div", { className: cx('mortgage-data-title'), children: _jsx("h4", { className: cx('mortgage-data-title__text'), children: t('list_credits_title') }) }), isDesktop && (_jsx("div", { className: cx('mortgage-data-form'), children: _jsxs("div", { className: cx('mortgage-data-form__items'), children: [creditData.map((item) => (_jsxs(Fragment, { children: [_jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('col', 'col-1'), children: _jsx(DropdownMenu, { title: t('bank_apply_credit'), data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.bank, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.bank`, value) }) }), _jsx("div", { className: cx('col', 'col-2'), children: _jsx(FormattedInput, { title: t('amount_credit_title'), placeholder: "1,000,000", value: item.amount, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.amount`, value) }) }), _jsx("div", { className: cx('col', 'col-3'), children: _jsx(FormattedInput, { title: t('calculate_mortgage_initial_payment'), placeholder: "1,000,000", value: item.monthlyPayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.monthlyPayment`, value) }) }), _jsx("div", { className: cx('col', 'col-4'), children: item.id !== 1 && (_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id) })) })] }, item.id), _jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('col', 'col-1'), children: _jsx(Calendar, { title: t('refinance_credit_start_date'), placeholder: t('date_ph'), value: item.startDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.startDate`, value) }) }), _jsx("div", { className: cx('col', 'col-2'), children: _jsx(Calendar, { title: t('refinance_credit_end_date'), placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.endDate`, value) }) }), _jsx("div", { className: cx('col', 'col-3'), children: values.refinancingCredit &&
                                                        values.refinancingCredit !== 'option_3' && (_jsx(FormattedInput, { title: t('early_repayment'), placeholder: "1,000,000", value: item.earlyRepayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.earlyRepayment`, value) })) }), _jsx("div", { className: cx('col', 'col-4') })] })] }, item.id))), _jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('col', 'col-1'), children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_credit'), onClick: addCreditData }) }), _jsx("div", { className: cx('col', 'col-2') }), _jsx("div", { className: cx('col', 'col-3') }), _jsx("div", { className: cx('col', 'col-4') }), _jsx("div", { className: cx('col', 'col-5') })] })] }) })), isTablet && (_jsx("div", { className: cx('mortgage-data-form'), children: _jsxs(Row, { children: [creditData.map((item, index) => (_jsxs(Fragment, { children: [_jsx(Column, { children: _jsx(DropdownMenu, { title: t('bank_apply_credit'), data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.bank, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.bank`, value) }) }), _jsx(Column, { children: _jsx(FormattedInput, { title: t('amount_credit_title'), placeholder: "1,000,000", value: item.amount, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.amount`, value) }) }), _jsx(Column, { children: _jsx(FormattedInput, { title: t('calculate_mortgage_initial_payment'), placeholder: "1,000,000", value: item.monthlyPayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.monthlyPayment`, value) }) }), _jsx(Column, { children: _jsx(Calendar, { title: t('refinance_credit_start_date'), placeholder: t('date_ph'), value: item.startDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.startDate`, value) }) }), _jsx(Column, { children: _jsx(Calendar, { title: t('refinance_credit_end_date'), placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.endDate`, value) }) }), values.refinancingCredit &&
                                            values.refinancingCredit !== 'option_3' && (_jsx(Column, { children: _jsx(FormattedInput, { title: t('early_repayment'), placeholder: "1,000,000", value: item.earlyRepayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.earlyRepayment`, value) }) })), item.id !== 1 && (_jsx(Column, { children: _jsxs("div", { className: cx('delete-icon'), children: [_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id) }), t('delete')] }) })), index !== creditData.length - 1 && _jsx(Divider, {})] }, item.id))), _jsx(Column, { children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_credit'), onClick: addCreditData }) })] }) })), isMobile && (_jsx("div", { className: cx('mortgage-data-form'), children: _jsxs(Row, { children: [creditData.map((item, index) => (_jsxs(Fragment, { children: [_jsx(Column, { children: _jsx(DropdownMenu, { title: t('bank_apply_credit'), data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.bank, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.bank`, value) }) }), _jsx(Column, { children: _jsx(FormattedInput, { title: t('amount_credit_title'), placeholder: "1,000,000", value: item.amount, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.amount`, value) }) }), _jsx(Column, { children: _jsx(FormattedInput, { title: t('calculate_mortgage_initial_payment'), placeholder: "1,000,000", value: item.monthlyPayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.monthlyPayment`, value) }) }), _jsx(Column, { children: _jsx(Calendar, { title: t('refinance_credit_start_date'), placeholder: t('date_ph'), value: item.startDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.startDate`, value) }) }), _jsx(Column, { children: _jsx(Calendar, { title: t('refinance_credit_end_date'), placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`creditData.${item.id - 1}.endDate`, value) }) }), values.refinancingCredit &&
                                            values.refinancingCredit !== 'option_3' && (_jsx(Column, { children: _jsx(FormattedInput, { title: t('early_repayment'), placeholder: "1,000,000", value: item.earlyRepayment, handleChange: (value) => setFieldValue(`creditData.${item.id - 1}.earlyRepayment`, value) }) })), item.id !== 1 && (_jsx(Column, { children: _jsxs("div", { className: cx('delete-icon'), children: [_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id) }), t('delete')] }) })), index !== creditData.length - 1 && _jsx(Divider, {})] }, item.id))), _jsx(Column, { children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_credit'), onClick: addCreditData }) })] }) }))] }), _jsx(ExitModule, { text: t('remove_credit'), isVisible: opened, onCancel: close, onSubmit: removeCreditData })] }));
};
export default CreditData;
