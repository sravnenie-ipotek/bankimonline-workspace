import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import SocialItem from '@components/layout/Sidebar/MobileMenu/SocialItem/SocialItem.tsx';
import { SOCIAL_ITEM } from '@components/layout/Sidebar/MobileMenu/utils/constants.ts';
import styles from './SocialList.module.scss';
const cx = classNames.bind(styles);
const SocialList = () => {
    return (_jsx("ul", { className: cx('list'), children: SOCIAL_ITEM.map((item) => (_jsx(SocialItem, { href: item.href, src: item.src, alt: item.alt }, item.id))) }));
};
export default SocialList;
