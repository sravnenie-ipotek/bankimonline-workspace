import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import styles from './personalCabinet.module.scss'
import { PersonalCabinetLayout } from './components/PersonalCabinetLayout/PersonalCabinetLayout'
import { SettingsPage } from './components/SettingsPage/SettingsPage'
import { PaymentsPage } from './components/PaymentsPage/PaymentsPage'
import { TransactionHistoryPage } from './components/TransactionHistoryPage/TransactionHistoryPage'
import { EmailSettingsModal } from './components/modals/EmailSettingsModal/EmailSettingsModal'
import { ChangeEmailModal } from './components/modals/ChangeEmailModal/ChangeEmailModal'
import { ChangePhoneModal } from './components/modals/ChangePhoneModal/ChangePhoneModal'
import { ChangePasswordModal } from './components/modals/ChangePasswordModal/ChangePasswordModal'
import { ProfilePhotoModal } from './components/modals/ProfilePhotoModal/ProfilePhotoModal'
import { MainDashboard } from './components/MainDashboard/MainDashboard'
import { ServiceSelectionDashboard } from './components/ServiceSelectionDashboard/ServiceSelectionDashboard'

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
  const location = useLocation()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  const handleOpenModal = (modalType: ModalType) => {
    setActiveModal(modalType)
  }

  // Mock user state - in real app would come from context/state
  const userHasSelectedService = false // This would be determined by actual user data

  // Determine which page to render based on URL
  const renderCurrentPage = () => {
    const path = location.pathname
    
    if (path.includes('/payments/history')) {
      return <TransactionHistoryPage />
    } else if (path.includes('/payments')) {
      return <PaymentsPage />
    } else if (path.includes('/settings') || path === '/personal-cabinet/settings') {
      return <SettingsPage onOpenModal={handleOpenModal} />
    } else {
      // Default to MainDashboard or ServiceSelectionDashboard based on user state
      return userHasSelectedService ? <MainDashboard /> : <ServiceSelectionDashboard />
    }
  }

  return (
    <div className={cx('personal-cabinet')}>
      <PersonalCabinetLayout>
        {renderCurrentPage()}
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