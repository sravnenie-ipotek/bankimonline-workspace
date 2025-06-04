import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import { Caret } from '@assets/icons/Caret'
import { Headphones } from '@assets/icons/Headphones'
import { CheckFat } from '@assets/icons/Messages/CheckFat'
import { WarningCircle } from '@assets/icons/Messages/WarningCircle'
import { Services } from '@assets/icons/Services'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './notifications.module.scss'

const cx = classNames.bind(styles)

interface NotificationsProps {
  status:
    | 'replyTechnSupport'
    | 'documentsAccepted'
    | 'documentsNotAccepted'
    | 'banksOffers' //статусы метки
  children: React.ReactNode //текст сообщения
  link: string // ссылка при нажатии
}

const Notification: React.FC<NotificationsProps> = ({
  status,
  children,
  link,
}: NotificationsProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const theme = useTheme()

  const notificationsClasses = {
    [status]: true, // Добавление css-класса, соответствующего текущему статусу
    [styles.documentStatusLabel]: true, // Добавление базового css-класса сообщения
  }

  const successIconColor = theme?.colors?.textTheme.primary
  const errorIconColor = theme?.colors?.error.error100

  return (
    <Link to={link}>
      <div className={cx(notificationsClasses)}>
        {(() => {
          switch (status) {
            case 'replyTechnSupport':
              return <Headphones color={successIconColor} size={24} />
            case 'documentsAccepted':
              return <CheckFat color={successIconColor} size={24} />
            case 'documentsNotAccepted':
              return <WarningCircle color={errorIconColor} size={24} />
            case 'banksOffers':
              return <Services color={successIconColor} size={24} />
            default:
              return null
          }
        })()}
        <p className={cx(styles.documentStatusLabelText)}>{children}</p>
        <div className={isRussian ? '' : 'rotate-180'}>
          <Caret color={successIconColor} size={24} />
        </div>
      </div>
    </Link>
  )
}

export default Notification
