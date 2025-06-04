//Мокка для проверки Accordion
import { useTranslation } from 'react-i18next'

import { Payment } from '@assets/icons/Payment'
import { Settings } from '@assets/icons/Settings'
import { UserProfile } from '@assets/icons/UserProfile'

const useUserLinks = () => {
  const { t } = useTranslation()

  return [
    {
      titile: t('userMenu.questionnaire'),
      path: '/user-profile',
      icon: UserProfile,
    },
    { titile: t('userMenu.settings'), path: '/settings', icon: Settings },
    { titile: t('userMenu.payments'), path: '/payments', icon: Payment },
  ]
}

export default useUserLinks
