import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './formContainer.module.scss';
const cx = classNames.bind(styles);
const FormContainer = ({ children }) => {
    return _jsx("div", { className: cx('form-container'), children: children });
};
export default FormContainer;
