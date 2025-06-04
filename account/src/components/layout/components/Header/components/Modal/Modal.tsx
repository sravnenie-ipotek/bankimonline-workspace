import classNames from 'classnames/bind'
import React, { useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'

import { useClickOut } from '@src/hooks/useClickOut.ts'

import i18n from '../../../../../../../utils/i18n'
import PortalWrapper from '../PortalWrapper/PortalWrapper.tsx'
import styles from './modal.module.scss'

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  handleClose: () => void
}

const cx = classNames.bind(styles)

const Modal: React.FC<ModalProps> = ({ children, isOpen, handleClose }) => {
  const nodeRef = useClickOut({ handleClickOut: handleClose })

  const isRussian = i18n.language === 'ru'

  // `useEffect` to listen for the "Escape" key and close the modal
  useEffect(() => {
    const closeOnEscapeKey = (e: KeyboardEvent) =>
      e.key === 'Escape' ? handleClose() : null
    document.body.addEventListener('keydown', closeOnEscapeKey)
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey)
    }
  }, [handleClose])

  // If `isOpen` is `false`, the modal won't be rendered
  /*  if (!isOpen) {
	 return null
	 }*/

  const modalSetStyles = isOpen
    ? `${styles.modal} ${styles.modalEnterDone}`
    : `${styles.modal} ${styles.modalExit}`

  return (
    <PortalWrapper targetId="react-portal-modal-container">
      {isOpen && (
        <CSSTransition
          in={isOpen}
          timeout={500}
          unmountOnExit
          classNames={styles.modal}
          nodeRef={nodeRef}
        >
          <div
            ref={nodeRef}
            className={cx(modalSetStyles, {
              'left-[85%]': isRussian,
              'right-[85%]': !isRussian,
            })}
          >
            <div onClick={handleClose}>{children}</div>
          </div>
        </CSSTransition>
      )}
    </PortalWrapper>
  )
}

export default Modal
