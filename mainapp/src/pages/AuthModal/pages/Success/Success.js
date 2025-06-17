import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { SuccessIcon } from '@assets/icons/SuccessIcon';
import BackButton from '@src/components/ui/BackButton/BackButton';
import { Button } from '@src/components/ui/ButtonUI';
import { useAppDispatch } from '@src/hooks/store';
import { setActiveModal } from '@src/pages/Services/slices/loginSlice';
import { closeModal } from '@src/pages/Services/slices/modalSlice';
import styles from './success.module.scss';
const cx = classNames.bind(styles);
const Success = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const dispatch = useAppDispatch();
    return (_jsxs("div", { className: cx('success'), children: [_jsxs("div", { className: cx('success-header'), children: [_jsx(SuccessIcon, { size: 80, color: "#FBE54D" }), _jsx("h3", { className: cx('success-title'), children: t('success_restore_password') })] }), _jsxs("div", { className: cx('success-footer'), children: [_jsx(Button, { onClick: () => dispatch(setActiveModal('auth')), className: cx('success-button'), children: t('enter') }), _jsx(BackButton, { handleClick: () => dispatch(closeModal()), className: cx('success-button'), title: t('close') })] })] }));
};
export default Success;
