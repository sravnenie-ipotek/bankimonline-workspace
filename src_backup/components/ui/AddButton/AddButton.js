import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { PlusIcon } from '../../../assets/icons/PlusIcon';
import styles from './addButton.module.scss';
const cx = classNames.bind(styles);
const AddButton = ({ value, error, onClick, variant = 'outline', color = 'white', ...props }) => {
    return (_jsx("div", { className: cx('wrapper'), ...props, children: _jsxs("button", { type: "button", onClick: onClick, style: { color }, className: cx('add-button', `${error && 'error'}`, {
                [`${variant}`]: variant,
            }), ...props, children: [_jsx(PlusIcon, { color: color }), _jsx("p", { className: cx('add-button-text'), children: value })] }) }));
};
export default AddButton;
