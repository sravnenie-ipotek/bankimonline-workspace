import classNames from 'classnames/bind'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useTranslation } from 'react-i18next'

import { DotsMenu } from '@assets/icons/DotsMenu'
import { Save } from '@assets/icons/Save'
import { useAppSelector } from '@src/hooks/store'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import styles from './mobileInfoPlate.module.scss'

const cx = classNames.bind(styles)

interface Transaction {
  id: string
  service: string
  sum: number
  date: string
  status: boolean
  check?: string | undefined
}

interface InfoPlateProps {
  visibleDownload: boolean
  setVisibleDownload: (isVisible: boolean) => void
  id: string
  check: string | undefined
  translationText: string
  currentFont: string
  dotsMenuCoordinates?: { top: number } | null
  isMobile: boolean
}

interface MobileInfoPlateProps {
  transaction: Transaction
}

const InfoPlate: React.FC<InfoPlateProps> = ({
  visibleDownload,
  setVisibleDownload,
  id,
  check,
  translationText,
  currentFont,
  dotsMenuCoordinates,
  isMobile,
}) => {
  const modalRoot = document.getElementById('modal-root')

  if (!modalRoot) return null
  const isRussian = currentFont === 'font-ru'
  return ReactDOM.createPortal(
    isMobile && visibleDownload && (
      <div
        className={cx(styles.mobileInfoPlate)}
        style={{
          top: `${dotsMenuCoordinates?.top}px`,
        }}
      >
        <p className={cx(styles.mobilePlateId)}>{id}</p>
        <p className={cx(styles.mobilePlateIdTitle)}>ID транзакции</p>
        {check && (
          <p
            className={cx(styles.transactionsDownload)}
            onClick={() => setVisibleDownload(false)}
          >
            <div className="w-fit">
              <Save size={20} color="white" />
            </div>
            <span className={isRussian ? 'ml-[8px]' : 'mr-[8px]'}>
              {translationText}
            </span>
          </p>
        )}
      </div>
    ),
    modalRoot
  )
}

const MobileInfoPlate: React.FC<MobileInfoPlateProps> = ({ transaction }) => {
  const [visibleDownload, setVisibleDownload] = useState(false)
  const { t } = useTranslation()
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const translationText = t('payments.transactions.download')
  const { isMobile } = useWindowResize()
  const [dotsMenuCoordinates, setDotsMenuCoordinates] = useState<{
    top: number
  } | null>(null)

  const handleDotsMenuClick = (
    event: React.MouseEvent<HTMLParagraphElement>
  ) => {
    // Получаем координаты элемента DotsMenu
    const dotsMenuRect = event.currentTarget.getBoundingClientRect()
    setDotsMenuCoordinates({
      top: dotsMenuRect.top + 32,
    })
    setVisibleDownload(!visibleDownload)
  }

  return (
    <>
      <p onClick={handleDotsMenuClick}>
        <DotsMenu color="white" />
        <InfoPlate
          visibleDownload={visibleDownload}
          setVisibleDownload={setVisibleDownload}
          id={transaction.id}
          check={transaction.check}
          translationText={translationText}
          currentFont={currentFont}
          dotsMenuCoordinates={dotsMenuCoordinates}
          isMobile={isMobile}
        />
      </p>
    </>
  )
}

export default MobileInfoPlate
