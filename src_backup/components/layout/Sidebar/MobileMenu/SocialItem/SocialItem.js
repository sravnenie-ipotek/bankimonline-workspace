import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import styles from './SocialItem.module.scss';
const cx = classNames.bind(styles);
const SocialItem = ({ href, src, alt }) => {
    return (_jsx("div", { className: cx('items'), children: _jsx(Link, { to: href, children: _jsx("img", { src: src, alt: alt }) }) }));
};
export default SocialItem;
