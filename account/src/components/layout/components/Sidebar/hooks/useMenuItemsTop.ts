import { useTranslation } from 'react-i18next'

import { Chat } from '@assets/icons/Chat.tsx'
import { Document } from '@assets/icons/Document.tsx'
import { Home } from '@assets/icons/Home.tsx'
import { IdentificationIcon } from '@assets/icons/IdentificationIcon.tsx'
import { Services } from '@assets/icons/Services.tsx'
import { IMenuItem } from '@layout/components/Sidebar/types/menuItem.ts'
import useRoute from '@src/hooks/useRoute'

const useMenuItemsTop = (): IMenuItem[] => {
  const { nav } = useRoute()
  const { t } = useTranslation()
  return [
    {
      title: t('sidebar.home'),
      path: nav('home'),
      icon: Home,
    },
    {
      title: t('sidebar.questionnaire'),
      path: nav('questionnaire'),
      icon: IdentificationIcon,
    },
    {
      title: t('sidebar.documents'),
      path: nav('documents'),
      icon: Document,
    },
    {
      title: t('sidebar.services'),
      path: nav('services'),
      icon: Services,
    },
    {
      title: t('sidebar.chat'),
      path: nav('chat'),
      icon: Chat,
    },
  ]
}

export default useMenuItemsTop
