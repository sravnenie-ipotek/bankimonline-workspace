import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Close } from '@assets/icons/Close.tsx';
import useOutsideClick from '@src/hooks/useOutsideClick.ts';
import { cancelDialog, dialogSelector } from '@src/store/slices/dialogSlice.ts';
import styles from './Dialog.module.scss';
export const Dialog = () => {
    const dispatch = useDispatch();
    const { title, onOk, okTitle, onCancel, onClose, cancelTitle, isVisible, content, isCloseIcon,
    // maxWidth,
     } = useSelector(dialogSelector);
    const outsideClickRef = useOutsideClick(handleClose);
    /*Отмена какого-либо действия нажатием на кнопку отмены. OnCancel - функция, которая сработает в случае отмены */
    function handleCancel() {
        onCancel && onCancel();
        dispatch(cancelDialog());
    }
    /* Подтверждение какого-либо действия нажатием на кнопку подтверждения. onOk - функция, которая сработает в случае подтверждения */
    function handleOk() {
        onOk && onOk();
        dispatch(cancelDialog());
    }
    function handleClose() {
        onClose && onClose();
        dispatch(cancelDialog());
    }
    const dialog = isVisible && (_jsx("div", { ref: outsideClickRef, className: styles.overlay, children: _jsxs("div", { 
            // style={{ maxWidth: maxWidth || '600px' }}
            className: cn(styles.dialog, {
            // [`max-w-[600px]`]: !maxWidth,
            }), children: [isCloseIcon && (_jsx("button", { className: styles.close, onClick: handleClose, children: _jsx(Close, { size: 24, color: "white" }) })), title && _jsx("h3", { className: styles.dialogTitle, children: title }), _jsx("div", { className: styles.content, children: content }), _jsxs("div", { className: styles.footerButtons, children: [okTitle && (_jsx("button", { className: styles.ok, onClick: handleOk, children: okTitle })), cancelTitle && (_jsx("button", { className: styles.cancel, onClick: handleCancel, children: cancelTitle }))] })] }) }));
    return dialog;
};
