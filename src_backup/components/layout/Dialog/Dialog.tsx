import cn from 'classnames'
import { useDispatch, useSelector } from 'react-redux'

import { Close } from '@assets/icons/Close.tsx'
import useOutsideClick from '@src/hooks/useOutsideClick.ts'
import { cancelDialog, dialogSelector } from '@src/store/slices/dialogSlice.ts'

import styles from './Dialog.module.scss'

export const Dialog = () => {
  const dispatch = useDispatch()
  const {
    title,
    onOk,
    okTitle,
    onCancel,
    onClose,
    cancelTitle,
    isVisible,
    content,
    isCloseIcon,
    // maxWidth,
  } = useSelector(dialogSelector)
  const outsideClickRef = useOutsideClick(handleClose)

  /*Отмена какого-либо действия нажатием на кнопку отмены. OnCancel - функция, которая сработает в случае отмены */
  function handleCancel() {
    onCancel && onCancel()
    dispatch(cancelDialog())
  }

  /* Подтверждение какого-либо действия нажатием на кнопку подтверждения. onOk - функция, которая сработает в случае подтверждения */
  function handleOk() {
    onOk && onOk()
    dispatch(cancelDialog())
  }

  function handleClose() {
    onClose && onClose()
    dispatch(cancelDialog())
  }

  const dialog = isVisible && (
    <div ref={outsideClickRef} className={styles.overlay}>
      <div
        // style={{ maxWidth: maxWidth || '600px' }}
        className={cn(styles.dialog, {
          // [`max-w-[600px]`]: !maxWidth,
        })}
      >
        {isCloseIcon && (
          <button className={styles.close} onClick={handleClose}>
            <Close size={24} color="white" />
          </button>
        )}
        {title && <h3 className={styles.dialogTitle}>{title}</h3>}
        <div className={styles.content}>{content}</div>
        <div className={styles.footerButtons}>
          {okTitle && (
            <button className={styles.ok} onClick={handleOk}>
              {okTitle}
            </button>
          )}
          {cancelTitle && (
            <button className={styles.cancel} onClick={handleCancel}>
              {cancelTitle}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return dialog
}
