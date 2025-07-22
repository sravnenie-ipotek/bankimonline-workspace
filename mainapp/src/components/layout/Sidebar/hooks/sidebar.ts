import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import { IMenuItem } from '../types/menuItem.ts'

const useMenuItems = (): IMenuItem[] => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('sidebar')

  return [
    {
      title: getContent('sidebar_company_1', t('sidebar_company_1')),
      path: '/services',
      icon: CaretRightIcon,
    },
    {
      title: getContent('sidebar_company_2', t('sidebar_company_2')),
      path: '/about',
    },
    {
      title: getContent('sidebar_company_5', t('sidebar_company_5')),
      path: '/Real-Estate-Brokerage',
    },
    {
      title: getContent('sidebar_company_3', t('sidebar_company_3')),
      path: '/vacancies',
    },
    {
      title: getContent('sidebar_company_4', t('sidebar_company_4')),
      path: '/contacts',
    },
  ]
}

const useBusinessMenuItems = (): IMenuItem[] => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('sidebar')

  return [
    {
      title: getContent('sidebar_business_1', t('sidebar_business_1')),
      path: '/',
      icon: CaretRightIcon,
    },
    {
      title: getContent('sidebar_business_2', t('sidebar_business_2')),
      path: '/cooperation',
    },
    {
      title: getContent('sidebar_business_3', t('sidebar_business_3')),
      path: '/tenders-for-brokers',
    },
    {
      title: getContent('sidebar_company_6', t('sidebar_company_6')),
      path: '/Real-Estate-Brokerage',
    },
    {
      title: getContent('sidebar_business_4', t('sidebar_business_4')),
      path: '/tenders-for-lawyers',
    },
  ]
}

export { useMenuItems, useBusinessMenuItems }
