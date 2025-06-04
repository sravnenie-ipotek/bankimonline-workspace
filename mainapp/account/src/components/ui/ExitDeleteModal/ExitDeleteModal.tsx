import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import { Button } from '../Button'
import { Modal } from '../Modal'
import styles from './exitDeleteModal.module.scss'

interface ExitDeleteModalProps {
  visibleModal: boolean
  setVisibleModal: (isVisible: boolean) => void
  icon: React.ReactNode
  title: string
  buttonText: string
  description?: string
  onClickFunction: () => void
}

const cx = classNames.bind(styles)

const ExitDeleteModal: React.FC<ExitDeleteModalProps> = ({
  visibleModal,
  setVisibleModal,
  icon,
  title,
  buttonText,
  description,
  onClickFunction,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  return (
    <Modal visibleModal={visibleModal} setVisibleModal={setVisibleModal}>
      <div className={cx(styles.topPlateModal)}>
        <div className={cx(styles.singOutPlate, !isRussian && 'rotate-180')}>
          {icon}
        </div>
        <p className={cx(styles.modaltextTitle)}>{title}</p>
        {description && (
          <p className={cx(styles.modaltextDescription)}>{description}</p>
        )}
      </div>
      <div className={cx(styles.bottomPlateModal)}>
        <Button
          className={cx(
            isRussian ? styles.buttonMarginR : styles.buttonMarginL
          )}
          size="smallLong"
          variant="modalWarning"
          onClick={onClickFunction}
        >
          {buttonText}
        </Button>
        <Button
          size="smallLong"
          variant="secondary"
          onClick={() => setVisibleModal(false)}
        >
          {t('deleteModal.cancel')}
        </Button>
      </div>
      <div className={cx(styles.bottomPlateModalModal)}>
        <Button
          className={cx(styles.buttonMarginMobile)}
          view="flex"
          size="smallLong"
          variant="modalWarning"
          onClick={onClickFunction}
        >
          {buttonText}
        </Button>
        <Button
          size="smallLong"
          variant="secondary"
          view="flex"
          onClick={() => setVisibleModal(false)}
        >
          {t('deleteModal.cancel')}
        </Button>
      </div>
    </Modal>
  )
}

export default ExitDeleteModal
