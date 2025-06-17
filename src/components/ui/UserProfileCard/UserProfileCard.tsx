import classNames from 'classnames/bind'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Delete from '@assets/icons/Delete'
import DotsTreeVertical from '@assets/icons/DotsTreeVertical'
import PencilIcon from '@assets/icons/PencilIcon'
import { Column } from '@components/ui/Column'
import { useClickOut } from '@src/hooks/useClickOut'
import { formatPhoneNumber } from '@src/pages/Services/utils/formatPhoneNumber'

import styles from './userProfile.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  name?: string
  phone?: string
  enableEdit?: boolean
  onEdit?: () => void
  onDelete?: () => void
}
const UserProfileCard: React.FC<TypeProps> = ({
  name,
  phone,
  enableEdit,
  onEdit,
  onDelete,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const [isMenuVisible, setMenuVisible] = useState(false)

  const toggleMenu = () => {
    setMenuVisible(true)
  }
  const closeMenu = () => {
    setMenuVisible(false)
  }

  const menuRef = useClickOut({ handleClickOut: closeMenu })

  return (
    <Column>
      <div className={cx('user-profile__card')} ref={menuRef}>
        <div className={cx('card')}>
          <div className={cx('wrapper')}>
            <span className={cx('card-name')}>{name && name}</span>
            {phone && <hr className={cx('card-hr')} />}
            <span className={cx('card-phone')}>
              {phone && formatPhoneNumber(phone, i18n.language)}
            </span>
          </div>
          {enableEdit && (
            <div className={cx('card-edit')} onClick={toggleMenu}>
              <DotsTreeVertical />
            </div>
          )}
        </div>

        {isMenuVisible && (
          <div className={cx('menu')}>
            <div className={cx('menu-item')} onClick={onEdit}>
              <p className={cx('menu-item__text')}>{t('edit')}</p>
              <div className={cx('menu-item__pencil')}>
                <PencilIcon />
              </div>
            </div>
            <div className={cx('menu-item')} onClick={onDelete}>
              <p className={cx('menu-item__text')}>{t('delete')}</p>
              <div className={cx('menu-item__delete')}>
                <Delete />
              </div>
            </div>
          </div>
        )}
      </div>
    </Column>
  )
}

export default UserProfileCard
