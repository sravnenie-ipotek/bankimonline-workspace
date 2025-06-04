import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Save } from '@assets/icons'
import { Close } from '@assets/icons/Close'
import { Button } from '@src/components/ui/Button'
import { DoubleButton } from '@src/components/ui/DoubleButton'
import { Modal } from '@src/components/ui/Modal'
import { useAppSelector } from '@src/hooks/store'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import styles from './viewDocumentModal.module.scss'

interface ViewDocumentModalProps {
  visibleModal: boolean
  setVisibleModal: (isVisible: boolean) => void
  alt: string
  path: string
  name: string
}

const cx = classNames.bind(styles)

const ViewDocumentModal: React.FC<ViewDocumentModalProps> = ({
  visibleModal,
  setVisibleModal,
  alt,
  path,
  name,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  const { isMobile } = useWindowResize()

  const [imgError, setImgError] = useState(false)

  //ориентация изображения

  const [isImgVertical, setIsImgVertical] = useState<boolean>(false)
  const [size, setSize] = useState(100)

  const checkImageOrientation = async () => {
    try {
      const img = new Image()
      img.src = path

      await img.decode()

      const newOrientation = img.width > img.height ? false : true
      setIsImgVertical(newOrientation)
    } catch (error) {
      console.error('Ошибка при загрузке изображения', error)
    }
  }

  useEffect(() => {
    checkImageOrientation()
  }, [])

  const plus = () => {
    if (size < 200) setSize(size + 25)
  }

  const minus = () => {
    if (size > 25) setSize(size - 25)
  }

  function saveUrlAsFile() {
    const link = document.createElement('a')
    link.href = path
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal visibleModal={visibleModal} setVisibleModal={setVisibleModal}>
      <div className={cx(styles.plateModal)}>
        <div className={cx(styles.exitPlate)}>
          <div
            className="cursor-pointer"
            onClick={() => setVisibleModal(false)}
          >
            <Close size={18} />
          </div>
        </div>
        {imgError ? (
          <p className={cx(styles.NoData)}>Изображение не загрузилось</p>
        ) : (
          <div
            className={cx(
              styles.imgPlate,
              isImgVertical ? 'h-[75vh]' : 'max-h-[75vh] h-full',
              size < 100 ? 'justify-center items-center' : '',
              'scrollbar scrollbar-thumb-gray-600 scrollbar-thumb-rounded-md scrollbar-w-1'
            )}
          >
            <img
              src={path}
              alt={alt}
              className={cx(
                isImgVertical
                  ? styles.imgViewVertical
                  : styles.imgViewHorisontal
              )}
              style={
                isImgVertical ? { height: `${size}%` } : { width: `${size}%` }
              }
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className={cx(styles.buttonLine)}>
          {!isMobile && <DoubleButton plus={plus} minus={minus} />}
          <Button
            variant="secondary"
            size="small"
            className={cx('h-[40px]', isRussian ? 'ml-[16px]' : 'mr-[16px]')}
            onClick={saveUrlAsFile}
          >
            <Save size={24} />
            <p className={isRussian ? 'ml-[6px]' : 'mr-[6px]'}>
              {t('documentModal.download')}
            </p>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ViewDocumentModal
