import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { closeModal } from '@src/pages/Services/slices/modalSlice'
import { setActiveModal, setIsLogin } from '@src/pages/Services/slices/loginSlice'
import PhoneVerificationModalDark from '@src/pages/AuthModal/pages/PhoneVerification/PhoneVerificationModalDark'

const MortgagePhoneVerificationModal: React.FC = () => {
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

  return (
    <PhoneVerificationModalDark 
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}

export default MortgagePhoneVerificationModal