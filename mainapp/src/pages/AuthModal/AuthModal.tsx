import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import {
  useSendSmsCodeEmailMutation,
  useSendSmsCodeMobileMutation,
} from '@src/services/auth/auth'

import { setActiveModal } from '../Services/slices/loginSlice'
import { closeModal } from '../Services/slices/modalSlice'
import styles from './authModal.module.scss'
import { Auth } from './pages/Auth'
import { Code } from './pages/Code'
import NewPassword from './pages/NewPassword/NewPassword'
import PhoneVerificationModal from './pages/PhoneVerification/PhoneVerificationModal'
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

  const dispatch = useAppDispatch()
  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setActiveModal('auth'))
  }

  const handleSendCodeMobile = async (values: { code: string }) => {
    try {
      const response = await sendCodeMobile({
        code: values.code,
        mobile_number: registrationData.mobile_number,
      }).unwrap()
      localStorage.setItem(USER_DATA, JSON.stringify(response.data))
      handleClose()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSendCodeEmail = async (values: { code: string }) => {
    try {
      const response = await sendCodeEmail({
        code: values.code,
        email: registrationData.email,
      }).unwrap()
      localStorage.setItem(USER_DATA, JSON.stringify(response.data))
      handleClose()
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
      activeModalComponent = <PhoneVerificationModal />
      break
    default:
      break
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
