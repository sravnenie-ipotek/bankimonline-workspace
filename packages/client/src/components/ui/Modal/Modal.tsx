import classNames from 'classnames/bind'
import { FC, ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { Close } from '@assets/icons/Close.tsx'
import i18n from '@src/utils/i18n'

import styles from './modal.module.scss'

const cx = classNames.bind(styles)

interface IDialogParams extends React.HTMLProps<HTMLDialogElement> {
  title?: string
  onOk?: () => void
  okTitle?: string
  onCancel?: () => void
  cancelTitle?: string
  isVisible: boolean
  className?: string
  children: ReactNode
}

const Modal: FC<IDialogParams> = ({
  title,
  onCancel,
  isVisible = false,
  children,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (isVisible) dialogRef?.current?.showModal()
    else dialogRef?.current?.close()
  }, [isVisible])

  /*Отмена какого-либо действия нажатием на кнопку отмены. OnCancel - функция, которая сработает в случае отмены */
  const closeDialog = () => {
    dialogRef?.current?.close()
    onCancel && onCancel()
  }

  // Handle click outside modal to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const rect = (e.target as HTMLDialogElement).getBoundingClientRect()
    const isInDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    )
    
    if (!isInDialog) {
      closeDialog()
    }
  }

  return (
    <>
      {isVisible &&
        createPortal(
          <dialog
            ref={dialogRef}
            className={cx('overlayDialogWrapper', className)}
            onClick={handleBackdropClick}
          >
            <div
              className={cx('dialogHeader')}
              style={{ direction: i18n.language === 'he' ? 'ltr' : 'rtl' }}
              onClick={(e) => e.stopPropagation()}
            >
              {title && <h3 className={cx('dialogTitle')}>{title}</h3>}
              <button
                type="button"
                onClick={closeDialog}
                className={cx('close')}
              >
                <Close size={24} color="white" />
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </dialog>,
          document.body
        )}
    </>
  )
}

export default Modal
