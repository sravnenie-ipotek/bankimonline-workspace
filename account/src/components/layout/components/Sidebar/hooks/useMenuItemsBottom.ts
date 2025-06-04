import { useTranslation } from 'react-i18next'

import { Logout } from '@assets/icons/Logout.tsx'
import { Payment } from '@assets/icons/Payment.tsx'
import { Settings } from '@assets/icons/Settings.tsx'
import { IMenuItem } from '@layout/components/Sidebar/types/menuItem.ts'
import useRoute from '@src/hooks/useRoute'

const useMenuItemsBottom = (): IMenuItem[] => {
  const { t } = useTranslation()
  const { nav } = useRoute()
  return [
    {
      title: t('sidebar.payments'),
      path: nav('payments'),
      icon: Payment,
    },
    {
      title: t('sidebar.settings'),
      path: nav('settings'),
      icon: Settings,
    },
    {
      title: t('sidebar.logout'),
      icon: Logout,
    },
  ]
}

export default useMenuItemsBottom
