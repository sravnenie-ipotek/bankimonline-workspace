import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import {
  useSendSmsCodeEmailMutation,
  useSendSmsCodeMobileMutation,
} from '@src/services/auth/auth'

import { setActiveModal, setIsLogin, updateRegistrationData, initializeUserData } from '../Services/slices/loginSlice'
import { closeModal } from '../Services/slices/modalSlice'
import styles from './authModal.module.scss'
import { Auth } from './pages/Auth'
import { Code } from './pages/Code'
import NewPassword from './pages/NewPassword/NewPassword'
import PhoneVerificationModal from './pages/PhoneVerification/PhoneVerificationModal'
import PhoneVerificationModalDark from './pages/PhoneVerification/PhoneVerificationModalDark'
import PhoneVerificationModalDarkHe from './pages/PhoneVerification/PhoneVerificationModalDarkHe'
import { ResetPassword } from './pages/ResetPassword'
import { SignUp } from './pages/SignUp'
import { Success } from './pages/Success'

const cx = classNames.bind(styles)

const USER_DATA = 'USER_DATA'

const AuthModal = () => {
  const { t, i18n } = useTranslation()

  const [sendCodeMobile] = useSendSmsCodeMobileMutation()
  const [sendCodeEmail] = useSendSmsCodeEmailMutation()

  const isOpen = useAppSelector((state) => state.modalSlice.isOpenAuth)
  const activeTab = useAppSelector((state) => state.login.activeTab)
  const registrationData = useAppSelector(
    (state) => state.login.registrationData
  )
  const loginData = useAppSelector((state) => state.login.loginData)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Initialize user data from localStorage if it exists but Redux state is empty
  const hasInitialized = React.useRef(false)
  
  React.useEffect(() => {
    if (hasInitialized.current) return
    
    const userData = localStorage.getItem(USER_DATA)
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        if (parsedUserData.nameSurname || parsedUserData.name_surname || parsedUserData.phoneNumber || parsedUserData.mobile_number) {
          dispatch(initializeUserData({
            nameSurname: parsedUserData.nameSurname || parsedUserData.name_surname,
            phoneNumber: parsedUserData.phoneNumber || parsedUserData.mobile_number
          }))
          hasInitialized.current = true
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
      }
    }
  }, [dispatch])

  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setActiveModal('auth'))
  }

  const goToNextStepIfInServiceFlow = () => {
    const currentPath = location.pathname
    if (currentPath.endsWith('/1')) {
      navigate(currentPath.replace(/\/1$/, '/2'))
    }
  }

  const handleSendCodeMobile = async (values: { code: string }) => {
    try {
      // Get phone number from localStorage (phone verification flow) or Redux state (signup flow)
      let phoneNumber = registrationData.mobile_number
      
      // Check if we have phone verification data in localStorage
      const userData = localStorage.getItem('USER_DATA')
      if (userData) {
        const parsedUserData = JSON.parse(userData)
        if (parsedUserData.mobile_number || parsedUserData.phoneNumber) {
          phoneNumber = parsedUserData.mobile_number || parsedUserData.phoneNumber
        }
      }
      
      console.log('🔵 AuthModal - SMS verification attempt:', { 
        code: values.code, 
        phoneNumber,
        registrationDataPhone: registrationData.mobile_number,
        userData: userData ? JSON.parse(userData) : null
      })
      
      if (!phoneNumber) {
        console.error('🔴 AuthModal - No phone number found for SMS verification')
        return
      }
      
      const response = await sendCodeMobile({
        code: values.code,
        mobile_number: phoneNumber,
      }).unwrap()
      
      console.log('🟢 AuthModal - SMS verification successful:', response)
      // Save user data
      localStorage.setItem(USER_DATA, JSON.stringify(response.data))
      // Update Redux login state
      dispatch(updateRegistrationData(response.data))
      
      const userDataForRedux = {
        nameSurname: response.data.user?.name || response.data.nameSurname || response.data.name_surname || 'Test User',
        phoneNumber: response.data.user?.phone || response.data.phoneNumber || response.data.mobile_number || phoneNumber
      }
      
      console.log('🟢 AuthModal - Initializing user data:', userDataForRedux)
      dispatch(initializeUserData(userDataForRedux))
      dispatch(setIsLogin())
      handleClose()
      goToNextStepIfInServiceFlow()
    } catch (error) {
      console.error('🔴 AuthModal - SMS verification error:', error)
    }
  }

  const handleSendCodeEmail = async (values: { code: string }) => {
    try {
      const response = await sendCodeEmail({
        code: values.code,
        email: registrationData.email,
      }).unwrap()
      localStorage.setItem(USER_DATA, JSON.stringify(response.data))
      dispatch(updateRegistrationData(response.data))
      
      const userDataForRedux = {
        nameSurname: response.data.nameSurname || response.data.name_surname,
        phoneNumber: response.data.phoneNumber || response.data.mobile_number || registrationData.mobile_number
      }
      
      console.log('🟢 AuthModal - Initializing user data (email):', userDataForRedux)
      dispatch(initializeUserData(userDataForRedux))
      dispatch(setIsLogin())
      handleClose()
      goToNextStepIfInServiceFlow()
    } catch (error) {
      console.error(error)
    }
  }

  const activeModal = useAppSelector((state) => state.login.activeModal)

  let activeModalComponent

  switch (activeModal) {
    case 'auth':
      activeModalComponent = <Auth />
      break
    case 'signUp':
      activeModalComponent = <SignUp />
      break
    case 'reset':
      activeModalComponent = <ResetPassword />
      break
    case 'codeAuth':
      activeModalComponent = (
        <Code
          title={t('accept_you_profile_for_enter')}
          subtitle={t('sms_phone')}
          onSubmit={(values) => {
            activeTab === 'phone'
              ? handleSendCodeMobile(values)
              : handleSendCodeEmail(values)
          }}
          buttonText={t('accept_phone')}
          onBack={() => {
            dispatch(setActiveModal('auth'))
          }}
        />
      )
      break
    case 'codeSignUp':
      activeModalComponent = (
        <Code
          title={t('accept_you_profile_for_registration')}
          subtitle={t('sms_phone')}
          onSubmit={(values) => {
            activeTab === 'phone'
              ? handleSendCodeMobile(values)
              : handleSendCodeEmail(values)
          }}
          buttonText={t('accept_phone')}
          onBack={() => {
            dispatch(setActiveModal('signUp'))
          }}
        />
      )
      break
    case 'newPassword':
      activeModalComponent = <NewPassword />
      break
    case 'codeNewPassword':
      activeModalComponent = (
        <Code
          title={t('accept_you_profile_for_registration')}
          subtitle={t('sms_phone')}
          onSubmit={() => {
            dispatch(setActiveModal('success'))
          }}
          buttonText={t('accept_phone')}
          onBack={() => {
            dispatch(setActiveModal('newPassword'))
          }}
        />
      )
      break
    case 'success':
      activeModalComponent = <Success />
      break
    case 'phoneVerification':
      activeModalComponent = i18n.language === 'he' 
        ? <PhoneVerificationModalDarkHe onClose={handleClose} />
        : <PhoneVerificationModalDark onClose={handleClose} />
      break
    default:
      break
  }

  // Special handling for phoneVerification modal which has its own backdrop
  if (activeModal === 'phoneVerification' && isOpen) {
    return activeModalComponent
  }

  return (
    <Modal
      isVisible={isOpen}
      onCancel={handleClose}
      className={cx('auth-modal')}
    >
      {activeModalComponent}
    </Modal>
  )
}

export default AuthModal
