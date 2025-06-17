import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import BackButton from '@src/components/ui/BackButton/BackButton';
import { Button } from '@src/components/ui/ButtonUI';
import { Column } from '@src/components/ui/Column';
import { useAppDispatch } from '@src/hooks/store.ts';
import { MainSourceOfIncome } from '@src/pages/Services/components/MainSourceOfIncome';
import { componentsByIncomeSource } from '@src/pages/Services/constants/componentsByIncomeSource';
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts';
import styles from './sourceOfIncomeForm.module.scss';
const cx = classNames.bind(styles);
const SourceOfIncomeForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { handleSubmit, isValid, values } = useFormikContext();
    const { mainSourceOfIncome } = values;
    const dispatch = useAppDispatch();
    return (_jsx(_Fragment, { children: _jsxs("div", { className: cx('modal'), children: [_jsxs("div", { className: cx('container'), children: [_jsx("div", { className: cx('component'), children: _jsx(MainSourceOfIncome, {}) }), componentsByIncomeSource[mainSourceOfIncome] &&
                            componentsByIncomeSource[mainSourceOfIncome].map((Component, index) => (_jsx("div", { className: cx('component'), children: Component }, index))), _jsx(Column, {})] }), _jsx("div", { className: cx('modal-buttons'), children: _jsxs("div", { className: cx('buttons'), children: [_jsx(BackButton, { title: t('button_back'), handleClick: () => dispatch(closeModal()) }), _jsx(Button, { type: "submit", isDisabled: !isValid, onClick: handleSubmit, size: "full", children: t('button_next_save') })] }) })] }) }));
};
export default SourceOfIncomeForm;
