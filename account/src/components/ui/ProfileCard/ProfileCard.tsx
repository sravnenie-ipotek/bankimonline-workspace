import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { UserProfileIconBig } from '@assets/icons/ProfileCard/UserProfileCardSecond.tsx'
import Modal from '@layout/components/Header/components/Modal/Modal.tsx'
import ProfileCardItem from '@src/components/ui/ProfileCard/ProfileCardItem/ProfileCardItem.tsx'
import { useAppSelector } from '@src/hooks/store.ts'
import { RootState } from '@src/store'

import styles from './propfileCard.module.scss'

const cx = classNames.bind(styles)

export const ProfileCard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const isRussian = currentFont === 'font-ru'

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  return (
    <div className={cx(styles.profileCardWrapper)}>
      <div className={cx(styles.profileCardTitleWrapper)}>
        <div className={cx(styles.profileCardTitle)}>
          {t('profileCard.title')}
        </div>
        <div
          className={cx(styles.dotWrapper, {
            'ml-[16px]': isRussian,
            'mr-[16px]': !isRussian,
          })}
          onClick={handleOpenModal}
        >
          <div className={cx(styles.dot)}></div>
          <div className={cx(styles.dot)}></div>
          <div className={cx(styles.dot)}></div>
        </div>
      </div>

      {isModalOpen && (
        <Modal handleClose={handleCloseModal} isOpen={isModalOpen}>
          <p style={{ color: 'white' }}>Modal is open</p>
        </Modal>
      )}

      <div className={cx(styles.profileCardDetailsWrapper)}>
        <UserProfileIconBig />
        <ProfileCardItem
          label={t('profileCard.nameSurname')}
          value={t('profileCard.nameSurnameValue')}
        />
        <ProfileCardItem
          label={t('profileCard.NumberPhone')}
          value={t('+ 935 55 324 3223')}
        />
        <ProfileCardItem label={'Email'} value={t('Bankimonline@mail.com')} />
      </div>
    </div>
  )
}

export default ProfileCard
