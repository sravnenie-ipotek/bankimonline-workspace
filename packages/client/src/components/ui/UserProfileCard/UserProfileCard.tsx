import classNames from 'classnames/bind'
import { useState, useEffect } from 'react'
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

// Helper function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const UserProfileCard: React.FC<TypeProps> = ({
  name,
  phone,
  enableEdit,
  onEdit,
  onDelete,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
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
          <div className={cx('profile-section')}>
            <div className={cx('avatar')}>
              {name ? (
                <span className={cx('avatar-initials')}>
                  {getInitials(name)}
                </span>
              ) : (
                <svg className={cx('avatar-icon')} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
            <div className={cx('user-info')}>
              <span className={cx('card-name')}>
                {name || t('user_profile_placeholder')}
              </span>
              <span className={cx('card-phone')}>
                {phone ? formatPhoneNumber(phone, i18n.language) : ''}
              </span>
            </div>
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
