import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import styles from './socialMediaItem.module.scss';
const cx = classNames.bind(styles);
// Компонент соцсетей
const SocialMediaItem = ({ src, class: className, title, imgClass, href, }) => {
    return (_jsx("div", { className: cx('contain'), children: _jsxs("div", { className: cx('wrap'), children: [_jsx("img", { src: src, alt: "", className: imgClass }), _jsx("span", { className: className, children: _jsx("a", { href: href, children: title }) })] }) }));
};
export default SocialMediaItem;
