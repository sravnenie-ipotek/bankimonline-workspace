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
import { ChangeEmailModal } from './components/modals/ChangeEmailModal/ChangeEmailModal'
import { ChangePhoneModal } from './components/modals/ChangePhoneModal/ChangePhoneModal'
import { ChangePasswordModal } from './components/modals/ChangePasswordModal/ChangePasswordModal'
import { ProfilePhotoModal } from './components/modals/ProfilePhotoModal/ProfilePhotoModal'
import { BankMeetingConfirmationModal } from './components/modals/BankMeetingConfirmationModal/BankMeetingConfirmationModal'
import { ApplicationAcceptedModal } from './components/modals/ApplicationAcceptedModal/ApplicationAcceptedModal'
import { PaymentConfirmationModal } from './components/modals/PaymentConfirmationModal/PaymentConfirmationModal'
import { PaymentModal } from './components/modals/PaymentModal/PaymentModal'
import { OfferModal } from './components/modals/OfferModal/OfferModal'
import { ProgramConditionsModal } from './components/modals/ProgramConditionsModal/ProgramConditionsModal'
import { ProgramSelectionPage } from './components/ProgramSelectionPage/ProgramSelectionPage'
import { HiddenBankProgramSelectionPage } from './components/HiddenBankProgramSelectionPage/HiddenBankProgramSelectionPage'
import { ProgramSelectionCalculationPage } from './components/ProgramSelectionCalculationPage/ProgramSelectionCalculationPage'
import { BankConfirmationPage } from './components/BankConfirmationPage/BankConfirmationPage'
import { MainDashboard } from './components/MainDashboard/MainDashboard'
import { ServiceSelectionDashboard } from './components/ServiceSelectionDashboard/ServiceSelectionDashboard'

const cx = classNames.bind(styles)

export type ModalType = 
  | 'emailSettings' 
  | 'changeEmail'
  | 'changePhone'
  | 'changePassword' 
  | 'profilePhoto'
  | 'bankMeetingConfirmation'
  | 'applicationAccepted'
  | 'paymentConfirmation'
  | 'payment'
  | 'offer'
  | 'programConditions'
  | null

const PersonalCabinet: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [programData, setProgramData] = useState<any>(null)

  const handleCloseModal = () => {
    setActiveModal(null)
    setAppointmentData(null)
    setProgramData(null)
  }

  const handleOpenModal = (modalType: ModalType, data?: any) => {
    setActiveModal(modalType)
    if (data) {
      if (modalType === 'programConditions') {
        setProgramData(data)
      } else {
        setAppointmentData(data)
      }
    }
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
    </div>
  )
}

export { PersonalCabinet }
export default PersonalCabinet 