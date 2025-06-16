import { useTranslation } from 'react-i18next';
const useSubMenuItems = () => {
    const { t } = useTranslation();
    return [
        {
            title: t('sidebar_sub_calculate_mortgage'),
            path: '/services/calculate-mortgage/1',
        },
        {
            title: t('sidebar_sub_refinance_mortgage'),
            path: '/services/refinance-mortgage/1',
        },
        {
            title: t('sidebar_sub_calculate_credit'),
            path: '/services/calculate-credit/1',
        },
        {
            title: t('sidebar_sub_refinance_credit'),
            path: '/services/refinance-credit/1',
        },
    ];
};
const useBusinessSubMenuItems = () => {
    const { t } = useTranslation();
    return [
        {
            title: t('sidebar_sub_bank_apoalim'),
            path: '/banks/apoalim',
        },
        {
            title: t('sidebar_sub_bank_discount'),
            path: '/banks/discount',
        },
        {
            title: t('sidebar_sub_bank_leumi'),
            path: '/banks/leumi',
        },
        {
            title: t('sidebar_sub_bank_beinleumi'),
            path: '/banks/beinleumi',
        },
        {
            title: t('sidebar_sub_bank_mercantile_discount'),
            path: '/banks/mercantile-discount',
        },
        {
            title: t('sidebar_sub_bank_jerusalem'),
            path: '/banks/jerusalem',
        },
    ];
};
export { useSubMenuItems, useBusinessSubMenuItems };
