import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Delete from '@assets/icons/Delete';
import DotsTreeVertical from '@assets/icons/DotsTreeVertical';
import PencilIcon from '@assets/icons/PencilIcon';
import { Column } from '@components/ui/Column';
import { useClickOut } from '@src/hooks/useClickOut';
import { formatPhoneNumber } from '@src/pages/Services/utils/formatPhoneNumber';
import styles from './userProfile.module.scss';
const cx = classNames.bind(styles);
const UserProfileCard = ({ name, phone, enableEdit, onEdit, onDelete, }) => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language.split('-')[0];
    const [isMenuVisible, setMenuVisible] = useState(false);
    const toggleMenu = () => {
        setMenuVisible(true);
    };
    const closeMenu = () => {
        setMenuVisible(false);
    };
    const menuRef = useClickOut({ handleClickOut: closeMenu });
    return (_jsx(Column, { children: _jsxs("div", { className: cx('user-profile__card'), ref: menuRef, children: [_jsxs("div", { className: cx('card'), children: [_jsxs("div", { className: cx('wrapper'), children: [_jsx("span", { className: cx('card-name'), children: name && name }), phone && _jsx("hr", { className: cx('card-hr') }), _jsx("span", { className: cx('card-phone'), children: phone && formatPhoneNumber(phone, i18n.language) })] }), enableEdit && (_jsx("div", { className: cx('card-edit'), onClick: toggleMenu, children: _jsx(DotsTreeVertical, {}) }))] }), isMenuVisible && (_jsxs("div", { className: cx('menu'), children: [_jsxs("div", { className: cx('menu-item'), onClick: onEdit, children: [_jsx("p", { className: cx('menu-item__text'), children: t('edit') }), _jsx("div", { className: cx('menu-item__pencil'), children: _jsx(PencilIcon, {}) })] }), _jsxs("div", { className: cx('menu-item'), onClick: onDelete, children: [_jsx("p", { className: cx('menu-item__text'), children: t('delete') }), _jsx("div", { className: cx('menu-item__delete'), children: _jsx(Delete, {}) })] })] }))] }) }));
};
export default UserProfileCard;
