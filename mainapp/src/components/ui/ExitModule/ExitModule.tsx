import classNames from 'classnames/bind'
import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { SignOut } from '@assets/icons/SignOut'

import { NewButton } from '../NewButton'
import styles from './exitModule.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  isVisible: boolean
  onCancel: () => void
  onSubmit: () => void
  text: string
  subtitle?: string
}

const ExitModule: React.FC<TypeProps> = ({
  isVisible,
  onCancel,
  onSubmit,
  text,
  subtitle,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (isVisible) dialogRef?.current?.showModal()
    else dialogRef?.current?.close()
  }, [isVisible])

  const closeDialog = () => {
    dialogRef?.current?.close()
    onCancel && onCancel()
  }

  return (
    <>
      {isVisible &&
        createPortal(
          <dialog ref={dialogRef} className={cx('dialog')}>
            <div className={cx('dialog-icon')}>
              <SignOut />
            </div>
            <div className={cx('dialog-text')}>{text}</div>
            {subtitle && <div className={cx('dialog-subtitle')}>{subtitle}</div>}
            <div className={cx('dialog-buttons')}>
              <NewButton
                text={t('confirm')}
                color="warning"
                onChange={onSubmit}
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
