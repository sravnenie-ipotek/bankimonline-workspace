import classNames from 'classnames/bind'
import React from 'react'
import ReactDOM from 'react-dom'

import styles from './modal.module.scss'

const cx = classNames.bind(styles)

type ModalProps = {
  visibleModal: boolean //видимость окна
  setVisibleModal: (isVisible: boolean) => void //изменение видимости окна
  children: React.ReactNode // Содержимое окна
}

const modalRoot = document.getElementById('modal-root')

const Modal: React.FC<ModalProps> = ({
  visibleModal,
  setVisibleModal,
  children,
}) => {
  //для демонстрации
  /*const localVisible = localStorage.getItem('modalVisible')

  useEffect(() => {
    {
      localVisible === 'true' ? setVisibleModal(true) : setVisibleModal(false)
    }
  }, [])*/

  if (!modalRoot) return null

  const closeModal = () => {
    localStorage.setItem('modalVisible', 'false')
    setVisibleModal(false)
  }

  return ReactDOM.createPortal(
    <div
      onClick={closeModal}
      className={cx(
        styles.modal,
        !visibleModal ? styles.nonVisibleModal : null
      )}
    >
      <div
        className={cx(styles.modalPlate)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    modalRoot
  )
}

export default Modal
