import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import classNames from 'classnames/bind';
import { useTranslation } from 'react-i18next';
import HowItWorks from '@components/ui/HowItWorks';
import SkipCookie from '@components/ui/SkipCookie/SkipCookie.tsx';
import { Container } from '@src/components/ui/Container';
import { PartnersSwiper } from '@src/components/ui/Swiper';
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster';
import TopServices from '../../components/ui/TopServices/TopServices';
import styles from './home.module.scss';
const cx = classNames.bind(styles);
// Компонент главной страницы
const Home = () => {
    const { t, i18n } = useTranslation();
    i18n.language = i18n.language?.split('-')[0];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: cx('home'), children: [_jsx(Container, { children: _jsx(VideoPoster, { title: t('title_compare'), subtitle: t('compare_in_5minutes'), text: t('show_offers') }) }), _jsx(TopServices, {}), _jsx(PartnersSwiper, {}), _jsx(HowItWorks, {})] }), _jsx(SkipCookie, {})] }));
};
export default Home;
