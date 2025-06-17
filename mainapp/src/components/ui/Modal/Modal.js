import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Close } from '@assets/icons/Close.tsx';
import i18n from '@src/utils/i18n';
import styles from './modal.module.scss';
const cx = classNames.bind(styles);
const Modal = ({ title, onCancel, isVisible = false, children, className, }) => {
    const dialogRef = useRef(null);
    useEffect(() => {
        if (isVisible)
            dialogRef?.current?.showModal();
        else
            dialogRef?.current?.close();
    }, [isVisible]);
    /*Отмена какого-либо действия нажатием на кнопку отмены. OnCancel - функция, которая сработает в случае отмены */
    const closeDialog = () => {
        dialogRef?.current?.close();
        onCancel && onCancel();
    };
    return (_jsx(_Fragment, { children: isVisible &&
            createPortal(_jsxs("dialog", { ref: dialogRef, className: cx('overlayDialogWrapper', className), children: [_jsxs("div", { className: cx('dialogHeader'), style: { direction: i18n.language === 'he' ? 'ltr' : 'rtl' }, children: [title && _jsx("h3", { className: cx('dialogTitle'), children: title }), _jsx("button", { type: "button", onClick: closeDialog, className: cx('close'), children: _jsx(Close, { size: 24, color: "white" }) })] }), children] }), document.body) }));
};
export default Modal;
