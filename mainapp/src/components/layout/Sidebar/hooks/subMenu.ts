import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { IMenuItem } from '@components/layout/Sidebar/types/menuItem.ts'

const useSubMenuItems = (): IMenuItem[] => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('sidebar')

  return [
    {
      title: getContent('sidebar_sub_calculate_mortgage', t('sidebar_sub_calculate_mortgage')),
      path: '/services/calculate-mortgage/1',
    },
    {
      title: getContent('sidebar_sub_refinance_mortgage', t('sidebar_sub_refinance_mortgage')),
      path: '/services/refinance-mortgage/1',
    },
    {
      title: getContent('sidebar_sub_calculate_credit', t('sidebar_sub_calculate_credit')),
      path: '/services/calculate-credit/1',
    },
    {
      title: getContent('sidebar_sub_refinance_credit', t('sidebar_sub_refinance_credit')),
      path: '/services/refinance-credit/1',
    },
  ]
}

const useBusinessSubMenuItems = (): IMenuItem[] => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('sidebar')

  return [
    {
      title: getContent('sidebar_sub_bank_apoalim', t('sidebar_sub_bank_apoalim')),
      path: '/banks/apoalim',
    },
    {
      title: getContent('sidebar_sub_bank_discount', t('sidebar_sub_bank_discount')),
      path: '/banks/discount',
    },
    {
      title: getContent('sidebar_sub_bank_leumi', t('sidebar_sub_bank_leumi')),
      path: '/banks/leumi',
    },
    {
      title: getContent('sidebar_sub_bank_beinleumi', t('sidebar_sub_bank_beinleumi')),
      path: '/banks/beinleumi',
    },
    {
      title: getContent('sidebar_sub_bank_mercantile_discount', t('sidebar_sub_bank_mercantile_discount')),
      path: '/banks/mercantile-discount',
    },
    {
      title: getContent('sidebar_sub_bank_jerusalem', t('sidebar_sub_bank_jerusalem')),
      path: '/banks/jerusalem',
    },
  ]
}

export { useSubMenuItems, useBusinessSubMenuItems }
