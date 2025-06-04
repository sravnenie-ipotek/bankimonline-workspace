import classNames from 'classnames'
import React from 'react'
import Dropzone from 'react-dropzone'
import { useTranslation } from 'react-i18next'

import { Close } from '@assets/icons/Close'
import { Phone } from '@assets/icons/Phone'
import { SignOut } from '@assets/icons/SignOut'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import { Button } from '../Button'
import { Modal } from '../Modal'
import styles from './uploadDocumentModal.module.scss'

interface UploadDocumentModalProps {
  visibleModal: boolean
  setVisibleModal: (isVisible: boolean) => void
}

const cx = classNames.bind(styles)

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  visibleModal,
  setVisibleModal,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const theme = useTheme()
  const iconColor = theme?.colors?.base.white

  const { t } = useTranslation()

  const { isDesktop } = useWindowResize()

  return (
    <Modal visibleModal={visibleModal} setVisibleModal={setVisibleModal}>
      <div className={cx(styles.plateModal)}>
        <div className={cx(styles.exitPlate)}>
          <div
            className="cursor-pointer"
            onClick={() => setVisibleModal(false)}
          >
            <Close size={18} color={iconColor} />
          </div>
        </div>
        <p className={cx(styles.exitTitle)}>
          {t('uploadDocument.desktop.title')}
        </p>
        <div className={cx(styles.exitUploadPlate)}>
          <Dropzone onDrop={(acceptedFiles) => console.log(acceptedFiles)}>
            {({ getRootProps, getInputProps }) => (
              <section className={cx(styles.uploadPlate)}>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div className={cx(styles.uploadLogoPlate)}>
                    <div className="-rotate-90 w-fit">
                      <SignOut size={32} color={iconColor} />
                    </div>
                  </div>
                  {isDesktop ? (
                    <p className={cx(styles.uploadPlateText)}>
                      {t('uploadDocument.desktop.dropText')}
                      <span className={cx(styles.uploadPlateTextAccent)}>
                        {t('uploadDocument.desktop.dropTextPC')}
                      </span>
                    </p>
                  ) : (
                    <p
                      className={cx(
                        styles.uploadPlateText,
                        styles.uploadPlateTextAccent
                      )}
                    >
                      {t('documents.loadPhone')}
                    </p>
                  )}
                </div>
              </section>
            )}
          </Dropzone>
          {isDesktop && (
            <>
              <p className={cx(styles.uploadTextOr)}>
                {t('uploadDocument.desktop.dropTextOr')}
              </p>
              <Button
                view="flex"
                variant="secondary"
                className={cx(styles.uploadOnMobileButton)}
              >
                <Phone color={iconColor} />
                <p
                  className={cx({
                    'ml-[11.25px]': isRussian,
                    'mr-[11.25px]': !isRussian,
                  })}
                >
                  {t('uploadDocument.desktop.buttonTextMobile')}
                </p>
              </Button>
            </>
          )}
        </div>
        <Button view="flex" className="h-[48px]">
          {t('uploadDocument.desktop.buttonTextUpload')}
        </Button>
      </div>
    </Modal>
  )
}

export default UploadDocumentModal
