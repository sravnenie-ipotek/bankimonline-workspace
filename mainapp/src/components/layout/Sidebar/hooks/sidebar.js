import { useTranslation } from 'react-i18next';
import { CaretRightIcon } from '@assets/icons/CaretRightIcon';
const useMenuItems = () => {
    const { t } = useTranslation();
    return [
        {
            title: t('sidebar_company_1'),
            path: '/',
            icon: CaretRightIcon,
        },
        {
            title: t('sidebar_company_2'),
            path: '/about',
        },
        {
            title: t('sidebar_company_3'),
            path: '/vacancies',
        },
        {
            title: t('sidebar_company_4'),
            path: '/contacts',
        },
    ];
};
const useBusinessMenuItems = () => {
    const { t } = useTranslation();
    return [
        {
            title: t('sidebar_business_1'),
            path: '/',
            icon: CaretRightIcon,
        },
        {
            title: t('sidebar_business_2'),
            path: '/cooperation',
        },
        {
            title: t('sidebar_business_3'),
            path: '/tenders-for-brokers',
        },
        {
            title: t('sidebar_business_4'),
            path: '/tenders-for-lawyers',
        },
    ];
};
export { useMenuItems, useBusinessMenuItems };
