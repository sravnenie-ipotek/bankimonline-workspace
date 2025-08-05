import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { closeModal, openAuthModal } from '@src/pages/Services/slices/modalSlice'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import PhoneVerificationModalDark from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDark'
import PhoneVerificationModalDarkHe from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDarkHe'

const MortgagePhoneVerificationModal: React.FC = () => {
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  
  const isOpen = useAppSelector((state) => state.modalSlice.isOpenLogin)

  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setActiveModal('login'))
  }

  const handleSuccess = () => {
    // Close phone verification modal
    dispatch(closeModal())
    // Open Auth modal and show SMS code step
    dispatch(setActiveModal('codeSignUp'))
    dispatch(openAuthModal())
  }

  if (!isOpen) return null

  return i18n.language === 'he' ? (
    <PhoneVerificationModalDarkHe 
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  ) : (
    <PhoneVerificationModalDark 
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}

export default MortgagePhoneVerificationModal