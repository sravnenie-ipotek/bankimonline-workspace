import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { SignOut } from '@assets/icons/SignOut';
import { NewButton } from '../NewButton';
import styles from './exitModule.module.scss';
const cx = classNames.bind(styles);
const ExitModule = ({ isVisible, onCancel, onSubmit, text, }) => {
    const dialogRef = useRef(null);
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    useEffect(() => {
        if (isVisible)
            dialogRef?.current?.showModal();
        else
            dialogRef?.current?.close();
    }, [isVisible]);
    const closeDialog = () => {
        dialogRef?.current?.close();
        onCancel && onCancel();
    };
    return (_jsx(_Fragment, { children: isVisible &&
            createPortal(_jsxs("dialog", { ref: dialogRef, className: cx('dialog'), children: [_jsx("div", { className: cx('dialog-icon'), children: _jsx(SignOut, {}) }), _jsx("div", { className: cx('dialog-text'), children: text }), _jsxs("div", { className: cx('dialog-buttons'), children: [_jsx(NewButton, { text: t('confirm'), color: "warning", onChange: onSubmit }), _jsx(NewButton, { text: t('cancel'), onChange: closeDialog })] })] }), document.body) }));
};
export default ExitModule;
