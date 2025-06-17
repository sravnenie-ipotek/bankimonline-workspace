import { jsx as _jsx } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useSwiper } from 'swiper/react';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
import styles from './swiperNavButtons.module.scss';
const cx = classNames.bind(styles);
export const SwiperLeftButtons = () => {
    const swiper = useSwiper();
    return (_jsx("button", { className: cx('left-icon'), onClick: () => swiper.slidePrev(), children: _jsx(CaretRightIcon, { color: "#fff" }) }));
};
export const SwiperRightButtons = () => {
    const swiper = useSwiper();
    return (_jsx("button", { className: cx('right-icon'), onClick: () => swiper.slideNext(), children: _jsx(CaretRightIcon, { color: "#fff" }) }));
};
