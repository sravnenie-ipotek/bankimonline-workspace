import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'

import styles from './personalCabinet.module.scss'
import { PersonalCabinetLayout } from './components/PersonalCabinetLayout/PersonalCabinetLayout'
import { SettingsPage } from './components/SettingsPage/SettingsPage'
import { EmailSettingsModal } from './components/modals/EmailSettingsModal/EmailSettingsModal'
import { ChangeEmailModal } from './components/modals/ChangeEmailModal/ChangeEmailModal'
import { ChangePhoneModal } from './components/modals/ChangePhoneModal/ChangePhoneModal'
import { ChangePasswordModal } from './components/modals/ChangePasswordModal/ChangePasswordModal'
import { ProfilePhotoModal } from './components/modals/ProfilePhotoModal/ProfilePhotoModal'

const cx = classNames.bind(styles)

export type ModalType = 
  | 'emailSettings' 
  | 'changeEmail'
  | 'changePhone'
  | 'changePassword' 
  | 'profilePhoto' 
  | null

const PersonalCabinet: React.FC = () => {
  const { t } = useTranslation()
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  const handleOpenModal = (modalType: ModalType) => {
    setActiveModal(modalType)
  }

  return (
    <div className={cx('personal-cabinet')}>
      <PersonalCabinetLayout>
        <SettingsPage onOpenModal={handleOpenModal} />
      </PersonalCabinetLayout>

      {/* Email Settings Modal - LK-180 */}
      <EmailSettingsModal 
        isOpen={activeModal === 'emailSettings'}
        onClose={handleCloseModal}
        onSuccess={(email) => {
          console.log('Email settings updated:', email)
          handleCloseModal()
        }}
      />

      {/* Change Email Modal - LK-178 */}
      <ChangeEmailModal 
        isOpen={activeModal === 'changeEmail'}
        onClose={handleCloseModal}
        onSuccess={(email) => {
          console.log('Email changed to:', email)
          handleCloseModal()
        }}
      />

      {/* Change Phone Modal - LK-176 */}
      <ChangePhoneModal 
        isOpen={activeModal === 'changePhone'}
        onClose={handleCloseModal}
        onSuccess={(phone) => {
          console.log('Phone changed to:', phone)
          handleCloseModal()
        }}
      />

      {/* Change Password Modal - LK-175 */}
      <ChangePasswordModal 
        isOpen={activeModal === 'changePassword'}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log('Password changed successfully')
          handleCloseModal()
        }}
      />

      {/* Profile Photo Modal - LK-174 */}
      <ProfilePhotoModal 
        isOpen={activeModal === 'profilePhoto'}
        onClose={handleCloseModal}
        onSuccess={(photo) => {
          console.log('Profile photo uploaded:', photo.name)
          handleCloseModal()
        }}
      />
    </div>
  )
}

export { PersonalCabinet }
export default PersonalCabinet 