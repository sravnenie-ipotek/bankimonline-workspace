import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import classNames from 'classnames/bind'

import styles from './personalCabinet.module.scss'
import { PersonalCabinetLayout } from './components/PersonalCabinetLayout/PersonalCabinetLayout'
import { SettingsPage } from './components/SettingsPage/SettingsPage'
import { PaymentsPage } from './components/PaymentsPage/PaymentsPage'
import { TransactionHistoryPage } from './components/TransactionHistoryPage/TransactionHistoryPage'
import { AppointmentSchedulingPage } from './components/AppointmentSchedulingPage/AppointmentSchedulingPage'
import { EmailSettingsModal } from './components/modals/EmailSettingsModal/EmailSettingsModal'
import { EmailVerificationModal } from './components/modals/EmailVerificationModal/EmailVerificationModal'
import { ChangeEmailModal } from './components/modals/ChangeEmailModal/ChangeEmailModal'
import { ChangePhoneModal } from './components/modals/ChangePhoneModal/ChangePhoneModal'
import PhoneVerificationModalDark from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDark'
import PhoneVerificationModalDarkHe from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDarkHe'
import { ChangePasswordModal } from './components/modals/ChangePasswordModal/ChangePasswordModal'
import { ChangeNameModal } from './components/modals/ChangeNameModal/ChangeNameModal'
import UploadProfilePhotoModal from './components/modals/UploadProfilePhotoModal/UploadProfilePhotoModal'
import { BankMeetingConfirmationModal } from './components/modals/BankMeetingConfirmationModal/BankMeetingConfirmationModal'
import { ApplicationAcceptedModal } from './components/modals/ApplicationAcceptedModal/ApplicationAcceptedModal'
import { PaymentConfirmationModal } from './components/modals/PaymentConfirmationModal/PaymentConfirmationModal'
import { PaymentModal } from './components/modals/PaymentModal/PaymentModal'
import { OfferModal } from './components/modals/OfferModal/OfferModal'
import { ProgramConditionsModal } from './components/modals/ProgramConditionsModal/ProgramConditionsModal'
import { CoBorrowerDeleteModal } from './components/modals/CoBorrowerDeleteModal/CoBorrowerDeleteModal'
import { CoBorrowerSelectionModal } from './components/modals/CoBorrowerSelectionModal/CoBorrowerSelectionModal'
import { ProgramSelectionPage } from './components/ProgramSelectionPage/ProgramSelectionPage'
import { HiddenBankProgramSelectionPage } from './components/HiddenBankProgramSelectionPage/HiddenBankProgramSelectionPage'
import { ProgramSelectionCalculationPage } from './components/ProgramSelectionCalculationPage/ProgramSelectionCalculationPage'
import { BankConfirmationPage } from './components/BankConfirmationPage/BankConfirmationPage'
import { MainDashboard } from './components/MainDashboard/MainDashboard'
import { ServiceSelectionDashboard } from './components/ServiceSelectionDashboard/ServiceSelectionDashboard'
import { QuestionnaireOverviewPage } from './components/QuestionnaireOverviewPage/QuestionnaireOverviewPage'
import { NotificationsPage } from './components/NotificationsPage/NotificationsPage'
import { ExitModule } from '@src/components/ui/ExitModule'

const cx = classNames.bind(styles)

export type ModalType = 
    | 'emailSettings'
  | 'emailVerification'
  | 'changeEmail'
  | 'changePhone'
  | 'phoneVerification'
  | 'changePassword'
  | 'changeName'
  | 'profilePhoto'
  | 'bankMeetingConfirmation'
  | 'applicationAccepted'
  | 'paymentConfirmation'
  | 'payment'
  | 'offer'
  | 'programConditions'
  | 'coBorrowerDelete'
  | 'coBorrowerSelection'
  | 'logout'
  | null

const PersonalCabinet: React.FC = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [programData, setProgramData] = useState<any>(null)
  const [emailToVerify, setEmailToVerify] = useState<string>('')
  const [phoneToVerify, setPhoneToVerify] = useState<string>('')
  const [coBorrowerToDelete, setCoBorrowerToDelete] = useState<{id: string, name?: string} | null>(null)

  const handleCloseModal = () => {
    setActiveModal(null)
    setAppointmentData(null)
    setProgramData(null)
    setEmailToVerify('')
    setPhoneToVerify('')
    setCoBorrowerToDelete(null)
  }

  const handleOpenModal = (modalType: ModalType, data?: any) => {
    setActiveModal(modalType)
    if (data) {
      if (modalType === 'programConditions') {
        setProgramData(data)
      } else if (modalType === 'coBorrowerDelete') {
        setCoBorrowerToDelete(data)
      } else {
        setAppointmentData(data)
      }
    }
  }

  // Handle logout functionality - LK-226
  const handleLogout = () => {
    // Clear user authentication state
    // In real app: clear tokens, user data, etc.
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    
    // Navigate to main page
    navigate('/')
    
    // Close modal
    handleCloseModal()
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
    } else if (path.includes('/appointment-scheduling')) {
      return <AppointmentSchedulingPage />
    } else if (path.includes('/bank-confirmation')) {
      return <BankConfirmationPage />
    } else if (path.includes('/program-selection-calculation')) {
      return <ProgramSelectionCalculationPage />
    } else if (path.includes('/hidden-bank-program-selection')) {
      return <HiddenBankProgramSelectionPage />
    } else if (path.includes('/program-selection')) {
      return <ProgramSelectionPage />
    } else if (path.includes('/questionnaire-overview') || path === '/personal-cabinet/questionnaire') {
      return <QuestionnaireOverviewPage onOpenModal={handleOpenModal} />
    } else if (path.includes('/notifications') || path === '/personal-cabinet/notifications') {
      return <NotificationsPage onOpenModal={handleOpenModal} />
    } else if (path.includes('/settings') || path === '/personal-cabinet/settings') {
      return <SettingsPage onOpenModal={handleOpenModal} />
    } else {
      // Default to MainDashboard or ServiceSelectionDashboard based on user state
      return userHasSelectedService ? <MainDashboard /> : <ServiceSelectionDashboard />
    }
  }

  // Handle appointment confirmation from state
  React.useEffect(() => {
    if (location.state?.appointmentData) {
      setAppointmentData(location.state.appointmentData)
      setActiveModal('bankMeetingConfirmation')
      // Clear the state to prevent showing modal again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // Handle application accepted confirmation from state
    if (location.state?.showApplicationAccepted) {
      setActiveModal('applicationAccepted')
      // Clear the state to prevent showing modal again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // Handle payment confirmation from state
    if (location.state?.showPaymentConfirmation) {
      setActiveModal('paymentConfirmation')
      // Clear the state to prevent showing modal again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // Handle offer modal from state
    if (location.state?.showOfferModal) {
      setActiveModal('offer')
      // Clear the state to prevent showing modal again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // Handle program conditions modal from state
    if (location.state?.showProgramConditions) {
      setActiveModal('programConditions')
      if (location.state?.programData) {
        setProgramData(location.state.programData)
      }
      // Clear the state to prevent showing modal again on refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, navigate, location.pathname])

  return (
    <div className={cx('personal-cabinet')}>
      <PersonalCabinetLayout onOpenModal={handleOpenModal}>
        {renderCurrentPage()}
      </PersonalCabinetLayout>

      {/* Email Settings Modal - LK-242 */}
      <EmailSettingsModal 
        isOpen={activeModal === 'emailSettings'}
        onClose={handleCloseModal}
        onSuccess={(email) => {
          console.log('Email settings updated:', email)
          setEmailToVerify(email)
          setActiveModal('emailVerification')
        }}
      />

      {/* Email Verification Modal - LK-241 */}
      <EmailVerificationModal 
        isOpen={activeModal === 'emailVerification'}
        email={emailToVerify}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log('Email verification successful for:', emailToVerify)
          handleCloseModal()
          // In real app: update user email in backend, refresh settings
        }}
        onBack={() => {
          setActiveModal('emailSettings')
        }}
      />

      {/* Change Email Modal - LK-178 */}
      <ChangeEmailModal 
        isOpen={activeModal === 'changeEmail'}
        onClose={handleCloseModal}
        currentEmail="user@example.com" // In real app, get from user state
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
          console.log('Phone updated, starting verification:', phone)
          setPhoneToVerify(phone)
          setActiveModal('phoneVerification')
        }}
      />

      {/* Phone Verification Modal - LK-239 with RTL support */}
      {activeModal === 'phoneVerification' && (
        i18n.language === 'he' ? (
          <PhoneVerificationModalDarkHe 
            onClose={handleCloseModal}
            onSuccess={() => {
              console.log('Phone verification successful for:', phoneToVerify)
              handleCloseModal()
              // In real app: update user phone in backend, refresh settings
            }}
          />
        ) : (
          <PhoneVerificationModalDark 
            onClose={handleCloseModal}
            onSuccess={() => {
              console.log('Phone verification successful for:', phoneToVerify)
              handleCloseModal()
              // In real app: update user phone in backend, refresh settings
            }}
          />
        )
      )}

      {/* Change Password Modal - LK-237 */}
      <ChangePasswordModal 
        isOpen={activeModal === 'changePassword'}
        onClose={handleCloseModal}
        onSuccess={() => {
          console.log('Password changed successfully')
          handleCloseModal()
        }}
      />

      {/* Change Name Modal - LK-235 */}
      <ChangeNameModal 
        isOpen={activeModal === 'changeName'}
        onClose={handleCloseModal}
        currentName="Александр Пушкин" // In real app, get from user state
        onSuccess={(name) => {
          console.log('Name changed to:', name)
          handleCloseModal()
          // In real app: update user name in backend, refresh settings
        }}
      />

      {/* Profile Photo Modal - LK-236 */}
      <UploadProfilePhotoModal 
        isOpen={activeModal === 'profilePhoto'}
        onClose={handleCloseModal}
        onSave={(photo) => {
          console.log('Profile photo uploaded:', photo.name)
          handleCloseModal()
          // In real app: upload to backend, update user profile
        }}
      />

      {/* Bank Meeting Confirmation Modal - LK-150 */}
      <BankMeetingConfirmationModal 
        isOpen={activeModal === 'bankMeetingConfirmation'}
        onClose={handleCloseModal}
        appointmentData={appointmentData}
      />

      {/* Application Accepted Modal - LK-148 */}
      <ApplicationAcceptedModal 
        isOpen={activeModal === 'applicationAccepted'}
        onClose={handleCloseModal}
      />

      {/* Payment Confirmation Modal - LK-146 */}
      <PaymentConfirmationModal 
        isOpen={activeModal === 'paymentConfirmation'}
        onClose={handleCloseModal}
      />

      {/* Payment Modal - LK-145 */}
      <PaymentModal 
        isOpen={activeModal === 'payment'}
        onClose={handleCloseModal}
        amount={1999}
      />

      {/* Offer Modal - LK-144 */}
      <OfferModal 
        isOpen={activeModal === 'offer'}
        onClose={handleCloseModal}
        amount={1999}
      />

      {/* Program Conditions Modal - LK-142 */}
      <ProgramConditionsModal 
        isOpen={activeModal === 'programConditions'}
        onClose={handleCloseModal}
        programData={programData}
      />

      {/* Co-borrower Delete Modal - LK-229 */}
      <CoBorrowerDeleteModal 
        isOpen={activeModal === 'coBorrowerDelete'}
        onClose={handleCloseModal}
        coBorrowerName={coBorrowerToDelete?.name}
        onConfirm={() => {
          // Handle co-borrower deletion
          if (coBorrowerToDelete?.id) {
            console.log('Deleting co-borrower:', coBorrowerToDelete.id)
            // In real app: dispatch deleteOtherBorrowers action with ID
            // dispatch(deleteOtherBorrowers(coBorrowerToDelete.id))
          }
        }}
      />

      {/* Co-borrower Selection Modal - LK-222 */}
      <CoBorrowerSelectionModal 
        isOpen={activeModal === 'coBorrowerSelection'}
        onClose={handleCloseModal}
        onContinue={(selectedCoBorrowers) => {
          // Handle co-borrower selection
          console.log('Selected co-borrowers:', selectedCoBorrowers)
          // In real app: save selected co-borrowers to state/API
          // dispatch(setSelectedCoBorrowers(selectedCoBorrowers))
        }}
        onSkip={() => {
          // Handle skip step
          console.log('Co-borrower selection skipped')
          // In real app: proceed without co-borrowers
        }}
      />

      {/* Logout Confirmation Modal - LK-226 */}
      <ExitModule 
        isVisible={activeModal === 'logout'}
        onCancel={handleCloseModal}
        onSubmit={handleLogout}
        text={t('logout_confirmation', 'Вы уверены, что хотите выйти из Личного кабинета?')}
      />
    </div>
  )
}

export { PersonalCabinet }
export default PersonalCabinet 