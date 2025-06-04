import classNames from 'classnames/bind'
import React from 'react'

import { CheckCircle, Close, WarningCircle } from '@assets/icons'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './alertBar.module.scss'

const cx = classNames.bind(styles)

interface AlertBarProps {
  text: string
  status: boolean
  visible: boolean
  setVisible: (isVisible: boolean) => void
}

const AlertBar: React.FC<AlertBarProps> = ({
  text,
  status,
  visible,
  setVisible,
}: AlertBarProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const theme = useTheme()
  const warningColor = theme?.colors?.warning.warning100
  const successColor = theme?.colors?.success.success100
  const primaryColor = theme?.colors?.textTheme.primary

  return (
    <div
      className={cx(
        styles.alertPlate,
        status ? styles.alertPlateSuccess : styles.alertPlateWarning,
        visible ? styles.alertPlateShow : styles.alertPlateHide,
        isRussian ? 'right-[121px]' : 'left-[121px]'
      )}
    >
      <div className="flex">
        {status ? (
          <CheckCircle size={24} color={successColor} />
        ) : (
          <WarningCircle size={24} color={warningColor} />
        )}
        <p className={cx(styles.alertBarText)}>{text}</p>
      </div>
      <div className="cursor-pointer" onClick={() => setVisible(false)}>
        <Close size={16} color={primaryColor} />
      </div>
    </div>
  )
}

export default AlertBar
