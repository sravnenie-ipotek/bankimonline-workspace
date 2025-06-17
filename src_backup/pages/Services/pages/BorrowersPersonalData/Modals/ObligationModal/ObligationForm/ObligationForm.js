import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@src/components/ui/ButtonUI';
import { Column } from '@src/components/ui/Column';
import { useAppDispatch } from '@src/hooks/store.ts';
import { Obligation } from '@src/pages/Services/components/Obligation';
import { componentsByObligation } from '@src/pages/Services/constants/componentsByObligation';
import { closeModal } from '@src/pages/Services/slices/modalSlice.ts';
import styles from './obligationForm.module.scss';
const cx = classNames.bind(styles);
const ObligationForm = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const { handleSubmit, isValid, values } = useFormikContext();
    const dispatch = useAppDispatch();
    const { obligation } = values;
    return (_jsx(_Fragment, { children: _jsxs("div", { className: cx('modal'), children: [_jsxs("div", { className: cx('container'), children: [_jsx(Obligation, {}), componentsByObligation[obligation] &&
                            componentsByObligation[obligation].map((Component, index) => (_jsx("div", { className: cx('component'), children: Component }, index))), _jsx(Column, {})] }), _jsx("div", { className: cx('modal-buttons'), children: _jsxs("div", { className: cx('buttons'), children: [_jsx(Button, { variant: "modalBase", type: "submit", onClick: () => dispatch(closeModal()), children: t('button_back') }), _jsx(Button, { type: "submit", isDisabled: !isValid, onClick: handleSubmit, size: "full", children: t('button_next_save') })] }) })] }) }));
};
export default ObligationForm;
