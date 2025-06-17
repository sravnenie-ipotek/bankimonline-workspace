import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PartnerCardFifth } from '@assets/icons/PartnersIcon/PartnerCardFifth';
import { PartnerCardFirst } from '@assets/icons/PartnersIcon/PartnerCardFirst';
import { PartnerCardFourth } from '@assets/icons/PartnersIcon/PartnerCardFourth';
import { PartnerCardSecond } from '@assets/icons/PartnersIcon/PartnerCardSecond';
import { PartnerCardSeventh } from '@assets/icons/PartnersIcon/PartnerCardSeventh';
import { PartnerCardSixth } from '@assets/icons/PartnersIcon/PartnerCardSixth';
import { PartnerCardThird } from '@assets/icons/PartnersIcon/PartnerCardThird';
import { SwiperLeftButtons, SwiperRightButtons, } from './SwiperNavButtonts/SwiperNavButtons';
import styles from './swiper.module.scss';
const cx = classNames.bind(styles);
const PartnersSwiper = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    const slides = [
        _jsx(PartnerCardFirst, {}, 1),
        _jsx(PartnerCardSecond, {}, 2),
        _jsx(PartnerCardThird, {}, 3),
        _jsx(PartnerCardFourth, {}, 4),
        _jsx(PartnerCardFifth, {}, 5),
        _jsx(PartnerCardSixth, {}, 6),
        _jsx(PartnerCardSeventh, {}, 7),
        _jsx(PartnerCardFirst, {}, 1),
        _jsx(PartnerCardSecond, {}, 2),
        _jsx(PartnerCardThird, {}, 3),
        _jsx(PartnerCardFourth, {}, 4),
        _jsx(PartnerCardFifth, {}, 5),
        _jsx(PartnerCardSixth, {}, 6),
        _jsx(PartnerCardSeventh, {}, 7),
    ];
    return (_jsxs("div", { className: cx('swiper__wrapper'), children: [_jsx("div", { className: cx('swiper__title'), children: _jsx("span", { children: t('banks_partners') }) }), _jsxs(Swiper, { slidesPerView: 'auto', loop: true, className: cx('swiper'), children: [slides.map((item, index) => (_jsx(SwiperSlide, { className: cx('swiper__item'), children: _jsx("div", { className: cx('swiper__item-img'), children: item }) }, index))), _jsx(SwiperLeftButtons, {}), _jsx(SwiperRightButtons, {})] })] }));
};
export default PartnersSwiper;
