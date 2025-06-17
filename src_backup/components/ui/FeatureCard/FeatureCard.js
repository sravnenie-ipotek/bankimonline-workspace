import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './featureCard.module.scss';
const cx = classNames.bind(styles);
const FeatureCard = ({ icon, title, text, size = 'default', }) => {
    const sizeClasses = {
        [size]: true,
    };
    return (_jsxs("div", { className: cx('card', sizeClasses), children: [_jsx("div", { className: cx('card-icon'), children: icon }), _jsx("div", { className: cx('card-title'), children: title }), _jsx("div", { className: cx('card-text'), children: text })] }));
};
export default FeatureCard;
