import classNames from 'classnames/bind'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { SignOut } from '@assets/icons/SignOut'

import { NewButton } from '../NewButton'
import styles from './exitModule.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  opened?: boolean
  onClose?: () => void
  onConfirm?: () => void
  title?: string
  subtitle?: string
  confirmText?: string
  // Legacy props for backward compatibility
  isVisible?: boolean
  onCancel?: () => void
  onSubmit?: () => void
  text?: string
}

const ExitModule: React.FC<TypeProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  subtitle,
  confirmText,
  // Legacy props
  isVisible,
  onCancel,
  onSubmit,
  text,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const { t, i18n } = useTranslation()
  
  // Use new props if available, fall back to legacy props
  const visible = opened ?? isVisible ?? false
  const handleCancel = onClose ?? onCancel ?? (() => {})
  const handleConfirm = onConfirm ?? onSubmit ?? (() => {})
  const displayText = title ?? text ?? ''
  const displayConfirmText = confirmText ?? t('confirm')

  useEffect(() => {
    if (visible) dialogRef?.current?.showModal()
    else dialogRef?.current?.close()
  }, [visible])

  const closeDialog = () => {
    dialogRef?.current?.close()
    handleCancel()
  }

  return (
    <>
      {visible &&
        createPortal(
          <dialog ref={dialogRef} className={cx('dialog')}>
            <div className={cx('dialog-icon')}>
              <SignOut />
            </div>
            <div className={cx('dialog-text')}>{displayText}</div>
            {subtitle && <div className={cx('dialog-subtitle')}>{subtitle}</div>}
            <div className={cx('dialog-buttons')}>
              <NewButton
                text={displayConfirmText}
                color="warning"
                onChange={handleConfirm}
              />
              <NewButton text={t('cancel')} onChange={closeDialog} />
            </div>
          </dialog>,
          document.body
        )}
    </>
  )
}

export default ExitModule
