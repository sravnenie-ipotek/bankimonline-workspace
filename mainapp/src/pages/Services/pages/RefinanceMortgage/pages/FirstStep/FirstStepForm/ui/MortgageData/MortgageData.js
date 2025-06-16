import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteIcon } from '@assets/icons/DeleteIcon';
import { PercentIcon } from '@assets/icons/PercentIcon';
import { WarningOctagonIcon } from '@assets/icons/warningOctagonIcon';
import { AddButton } from '@src/components/ui/AddButton';
import { AlertWarning } from '@src/components/ui/AlertWarning';
import { Calendar } from '@src/components/ui/Calendar';
import { Column } from '@src/components/ui/Column';
import Divider from '@src/components/ui/Divider/Divider';
import { DropdownMenu } from '@src/components/ui/DropdownMenu';
import { ExitModule } from '@src/components/ui/ExitModule';
import Control from '@src/components/ui/FormattedInput/Control/Control';
import { Row } from '@src/components/ui/Row';
import { TitleElement } from '@src/components/ui/TitleElement';
import useDisclosure from '@src/hooks/useDisclosure';
import { useWindowResize } from '@src/hooks/useWindowResize';
import { generateNewId } from '@src/pages/Services/utils/generateNewId.ts';
import styles from './mortgageData.module.scss';
const cx = classNames.bind(styles);
const MortgageData = () => {
    const [mortgageData, setMortgageData] = useState([]);
    const [idToDelete, setIdToDelete] = useState(null);
    const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext();
    const [opened, { open, close }] = useDisclosure(false);
    const { isDesktop, isTablet, isMobile } = useWindowResize();
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    useEffect(() => {
        setMortgageData(values.mortgageData);
    }, [values.mortgageData]);
    const addMortgageData = () => {
        const newId = generateNewId(mortgageData);
        const newData = {
            id: newId,
            program: '',
            balance: null,
            endDate: '',
            bid: null,
        };
        setFieldValue('mortgageData', [...mortgageData, newData]);
    };
    const openModalWithId = (id) => {
        setIdToDelete(id);
        open();
    };
    const removeMortgageData = () => {
        if (idToDelete !== null) {
            const filteredData = mortgageData.filter((item) => item.id !== idToDelete);
            setFieldValue('mortgageData', filteredData);
        }
        close();
    };
    const data = [
        { value: 'option_1', label: t('program_refinance_mortgage_option_1') },
        { value: 'option_2', label: t('program_refinance_mortgage_option_2') },
        { value: 'option_3', label: t('program_refinance_mortgage_option_3') },
        { value: 'option_4', label: t('program_refinance_mortgage_option_4') },
        { value: 'option_5', label: t('program_refinance_mortgage_option_5') },
    ];
    const sumBalance = mortgageData.reduce((total, item) => total + item.balance, 0);
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cx('mortgage-data'), children: [_jsxs("div", { className: cx('mortgage-data-title'), children: [_jsx("h4", { className: cx('mortgage-data-title__text'), children: t('enter_mortgage_info') }), touched.mortgageData && errors.mortgageData && (_jsx(AlertWarning, { filled: true, icon: _jsx(WarningOctagonIcon, { size: 24, color: "#E76143" }), children: _jsx("p", { children: t('error_balance', {
                                        fullBalance: values?.mortgageBalance?.toLocaleString('en-US'),
                                        sumBalance: sumBalance.toLocaleString('en-US'),
                                        notEnoughBalance: (values.mortgageBalance - sumBalance).toLocaleString('en-US'),
                                    }) }) }))] }), isDesktop && (_jsxs("div", { className: cx('mortgage-data-form'), children: [_jsxs("div", { className: cx('container', 'title'), children: [_jsx("p", { className: cx('col', 'col-1'), children: t('programm') }), _jsx("p", { className: cx('col', 'col-2'), children: t('balance') }), _jsx("p", { className: cx('col', 'col-3'), children: t('end_date') }), _jsx("p", { className: cx('col', 'col-4'), children: t('bid') }), _jsx("div", { className: cx('col', 'col-5') })] }), _jsxs("div", { className: cx('mortgage-data-form__items'), children: [mortgageData.map((item) => (_jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('col', 'col-1'), children: _jsx(DropdownMenu, { data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.program, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.program`, value) }) }), _jsx("div", { className: cx('col', 'col-2'), children: _jsx(Control, { placeholder: "10,000", value: item.balance, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.balance`, value), onBlur: () => setFieldTouched('mortgageData', true), error: touched.mortgageData && errors.mortgageData }) }), _jsx("div", { className: cx('col', 'col-3'), children: _jsx(Calendar, { placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.endDate`, value) }) }), _jsx("div", { className: cx('col', 'col-4'), children: _jsx(Control, { placeholder: "1", type: "numeric", value: item.bid, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.bid`, value), rightSection: _jsx(PercentIcon, { color: "#FFF" }) }) }), _jsx("div", { className: cx('col', 'col-5'), children: item.id !== 1 && (_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id), className: cx('delete') })) })] }, item.id))), _jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('col', 'col-1'), children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_programm'), onClick: addMortgageData }) }), _jsx("div", { className: cx('col', 'col-2') }), _jsx("div", { className: cx('col', 'col-3') }), _jsx("div", { className: cx('col', 'col-4') }), _jsx("div", { className: cx('col', 'col-5') })] })] })] })), isTablet && (_jsx("div", { className: cx('mortgage-data-form'), children: _jsx("div", { className: cx('mortgage-data-form__items'), children: _jsxs(Row, { children: [mortgageData.map((item, index) => (_jsxs(Fragment, { children: [_jsxs(Column, { children: [_jsx(TitleElement, { title: `${t('programm')} #${item.id}` }), _jsx(DropdownMenu, { data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.program, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.program`, value) })] }), _jsxs(Column, { children: [_jsx(TitleElement, { title: t('balance') }), _jsx(Control, { placeholder: "10,000", value: item.balance, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.balance`, value) })] }), _jsx(Column, { children: _jsx(Calendar, { title: t('end_date'), placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.endDate`, value) }) }), _jsxs(Column, { children: [_jsx(TitleElement, { title: t('bid') }), _jsx(Control, { placeholder: "1", value: item.bid, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.bid`, value), rightSection: _jsx(PercentIcon, { color: "#FFF" }) })] }), item.id !== 1 && (_jsx(Column, { children: _jsxs("div", { className: cx('delete-icon'), children: [_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id) }), t('delete')] }) })), index !== mortgageData.length - 1 && _jsx(Divider, {})] }, item.id))), _jsx(Column, { children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_programm'), onClick: addMortgageData }) })] }) }) })), isMobile && (_jsx("div", { className: cx('mortgage-data-form'), children: _jsx("div", { className: cx('mortgage-data-form__items'), children: _jsxs(Row, { children: [mortgageData.map((item, index) => (_jsxs(Fragment, { children: [_jsxs(Column, { children: [_jsx(TitleElement, { title: `${t('programm')} #${item.id}` }), _jsx(DropdownMenu, { data: data, placeholder: t('calculate_mortgage_first_ph'), value: item.program, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.program`, value) })] }), _jsxs(Column, { children: [_jsx(TitleElement, { title: t('balance') }), _jsx(Control, { placeholder: "10,000", value: item.balance, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.balance`, value) })] }), _jsx(Column, { children: _jsx(Calendar, { title: t('end_date'), placeholder: t('date_ph'), value: item.endDate, onChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.endDate`, value) }) }), _jsxs(Column, { children: [_jsx(TitleElement, { title: t('bid') }), _jsx(Control, { placeholder: "1", value: item.bid, handleChange: (value) => setFieldValue(`mortgageData.${item.id - 1}.bid`, value), rightSection: _jsx(PercentIcon, { color: "#FFF" }) })] }), item.id !== 1 && (_jsx(Column, { children: _jsxs("div", { className: cx('delete-icon'), children: [_jsx(DeleteIcon, { onClick: () => openModalWithId(item.id) }), t('delete')] }) })), index !== mortgageData.length - 1 && _jsx(Divider, {})] }, item.id))), _jsx(Column, { children: _jsx(AddButton, { variant: "none", color: "#FBE54D", value: t('add_programm'), onClick: addMortgageData }) })] }) }) }))] }), _jsx(ExitModule, { text: t('remove_programm'), isVisible: opened, onCancel: close, onSubmit: removeMortgageData })] }));
};
export default MortgageData;
