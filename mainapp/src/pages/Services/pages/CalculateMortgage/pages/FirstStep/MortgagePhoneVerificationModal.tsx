import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { closeModal } from '@src/pages/Services/slices/modalSlice'
import { setActiveModal, setIsLogin } from '@src/pages/Services/slices/loginSlice'
import PhoneVerificationModalDark from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDark'
import PhoneVerificationModalDarkHe from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDarkHe'

const MortgagePhoneVerificationModal: React.FC = () => {
  const { i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const isOpen = useAppSelector((state) => state.modalSlice.isOpenLogin)

  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setActiveModal('login'))
  }

  const handleSuccess = () => {
    // After successful phone verification, mark user as logged in
    dispatch(setIsLogin())
    dispatch(closeModal())
    dispatch(setActiveModal('login'))
    
    // Extract the current path and navigate to step 2
    const currentPath = location.pathname
    const newPath = currentPath.replace(/\/\d+$/, '')
    navigate(newPath + '/2')
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