import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Dropdown } from './components/Dropdown/Dropdown'
import Notification, {
  NotificationProps,
} from './components/Notification/Notification'
import NotificationOffer, {
  NotificationOfferProps,
} from './components/NotificationOffer/NotificationOffer'

const notifications = [
  {
    message: {
      body: 'Паспорт приняли',
      pathOffer: '/',
    },
    variant: 'success',
    bankName: 'leumi',
    title: 'Паспорт лицевая сторона',
    body: 'Паспорт приняли',
    pathOffer: '/',
    date: new Date(),
    isBank: true,
    isReaded: false,
  },
  {
    variant: 'error',
    bankName: 'leumi',
    title: '“Паспорт лицевая сторона” есть ошибки',
    body: 'Документ не принят. Документ плохо видно.Пожалуйста убедитесь что документ хорошо видно и попробуйте снова',
    pathChat: '/',
    pathError: '/',
    date: new Date(),
    isBank: true,
    isReaded: false,
  },
  {
    variant: 'info',
    title: 'Крис ответил',
    body: 'Чтобы загрузить паспорт пожалуйста нажмите на кнопку...',
    pathChat: '/',
    date: new Date(),
    isBank: false,
    isReaded: false,
  },
  {
    variant: 'offer',
    offer: 'loan',
    bankName: ['hapoalim', 'leumi', '...', '...', '...'],
    title: '77777',
    body: 'dsfsdfsdfsdfsdfsdfsdfsdfsd',
    pathOffer: '/',
    date: new Date(),
    isBank: true,
    isReaded: false,
  },
  {
    variant: 'error',
    bankName: 'hapoalim',
    title: '“Паспорт лицевая сторона” есть ошибки',
    body: 'Документ не принят. Документ плохо видно.Пожалуйста убедитесь что документ хорошо видно и попробуйте снова',
    pathChat: '/',
    pathError: '/',
    date: new Date(),
    isBank: true,
    isReaded: true,
  },
] as (NotificationProps | NotificationOfferProps)[]

const Notifications: FC = () => {
  const { t } = useTranslation()
  const unreadMessages = notifications.filter((item) => !item.isReaded)
    .length as number

  return (
    <div>
      <Dropdown
        type="notification"
        dropdownContainerTitle={t('notifications.notifications')}
        value={unreadMessages}
      >
        {/* {!!offers.length && <NotificationOffer props={offers} />} */}
        {!!notifications.length &&
          notifications.map((item, index) =>
            item.variant === 'offer' ? (
              <NotificationOffer key={index} {...item} />
            ) : (
              <Notification key={index} {...item} />
            )
          )}
      </Dropdown>
    </div>
  )
}

export default Notifications
