import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
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
  const { getContent } = useContentApi('sms_code_verification')

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
      
      : null
      })
      
      if (!phoneNumber) {
        console.error('🔴 AuthModal - No phone number found for SMS verification')
        return
      }
      
      const response = await sendCodeMobile({
        code: values.code,
        mobile_number: phoneNumber,
      }).unwrap()
      
      // Check if we have existing user data from phone verification modal
      const existingUserData = localStorage.getItem(USER_DATA)
      let preservedUserData = null
      if (existingUserData) {
        try {
          preservedUserData = JSON.parse(existingUserData)
          } catch (error) {
          console.error('Error parsing existing user data:', error)
        }
      }
      
      // Merge API response with preserved user data, prioritizing the user's input name
      const mergedUserData = {
        ...response.data,
        user: {
          ...response.data.user,
          name: preservedUserData?.name || preservedUserData?.nameSurname || response.data.user?.name || 'Test User',
          phone: phoneNumber
        },
        name: preservedUserData?.name || preservedUserData?.nameSurname || response.data.user?.name || 'Test User',
        nameSurname: preservedUserData?.name || preservedUserData?.nameSurname || response.data.user?.name || 'Test User',
        mobile_number: phoneNumber,
        phoneNumber: phoneNumber
      }
      
      // Save merged user data
      localStorage.setItem(USER_DATA, JSON.stringify(mergedUserData))
      // Update Redux login state
      dispatch(updateRegistrationData(mergedUserData))
      
      const userDataForRedux = {
        nameSurname: preservedUserData?.name || preservedUserData?.nameSurname || response.data.user?.name || 'Test User',
        phoneNumber: phoneNumber
      }
      
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
      // Check if we have existing user data from phone verification modal
      const existingUserData = localStorage.getItem(USER_DATA)
      let preservedUserData = null
      if (existingUserData) {
        try {
          preservedUserData = JSON.parse(existingUserData)
          :', preservedUserData)
        } catch (error) {
          console.error('Error parsing existing user data:', error)
        }
      }
      
      // Merge API response with preserved user data, prioritizing the user's input name
      const mergedUserData = {
        ...response.data,
        name: preservedUserData?.name || preservedUserData?.nameSurname || response.data.nameSurname || response.data.name_surname || 'Test User',
        nameSurname: preservedUserData?.name || preservedUserData?.nameSurname || response.data.nameSurname || response.data.name_surname || 'Test User',
        mobile_number: registrationData.mobile_number,
        phoneNumber: registrationData.mobile_number
      }
      
      localStorage.setItem(USER_DATA, JSON.stringify(mergedUserData))
      dispatch(updateRegistrationData(mergedUserData))
      
      const userDataForRedux = {
        nameSurname: preservedUserData?.name || preservedUserData?.nameSurname || response.data.nameSurname || response.data.name_surname || 'Test User',
        phoneNumber: registrationData.mobile_number
      }
      
      :', userDataForRedux)
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
          title={getContent('sms_code_modal_title', 'accept_you_profile_for_registration')}
          subtitle={getContent('sms_code_modal_subtitle', 'sms_phone')}
          onSubmit={(values) => {
            activeTab === 'phone'
              ? handleSendCodeMobile(values)
              : handleSendCodeEmail(values)
          }}
          buttonText={getContent('sms_code_verify_button', 'accept_phone')}
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
