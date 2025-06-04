import classNames from 'classnames/bind'
import React from 'react'
import ReactDOM from 'react-dom'

import { AlertBar } from '../AlertBar'
import styles from './alertPlate.module.scss'

const cx = classNames.bind(styles)

const alertRoot = document.getElementById('alert-root')

interface AlertPlateProps {
  text: string
  status: boolean
  visible: boolean
  setVisible: (isVisible: boolean) => void
}

const AlertPlate: React.FC<AlertPlateProps> = ({
  text,
  status,
  visible,
  setVisible,
}) => {
  if (!alertRoot) return null

  return ReactDOM.createPortal(
    <div className={cx(styles.alertPlate)}>
      <AlertBar
        text={text}
        status={status}
        visible={visible}
        setVisible={setVisible}
      />
    </div>,
    alertRoot
  )
}

export default AlertPlate
