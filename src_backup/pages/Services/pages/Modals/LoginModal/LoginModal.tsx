import { Modal } from '@src/components/ui/Modal'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice'

import { LoginForm } from './LoginForm'

const LoginModal = () => {
  const isOpen = useAppSelector((state) => state.modalSlice.isOpenLogin)

  const dispatch = useAppDispatch()
  const handleClose = () => {
    dispatch(closeModal())
    dispatch(setActiveModal('login'))
  }

  return (
    <Modal isVisible={isOpen} onCancel={handleClose}>
      <LoginForm />
    </Modal>
  )
}

export default LoginModal
