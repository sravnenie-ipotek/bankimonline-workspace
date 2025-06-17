import { jsx as _jsx } from "react/jsx-runtime";
import classnames from 'classnames/bind';
import TitleElement from '../TitleElement/TitleElement.tsx';
import styles from './formattedInput.module.scss';
const cx = classnames.bind(styles);
const Title = ({ title }) => {
    return (_jsx("div", { className: cx('custom-select-title'), children: _jsx("div", { className: cx('title-container'), children: _jsx("div", { className: cx('title-content'), children: _jsx(TitleElement, { title: title }) }) }) }));
};
export default Title;
