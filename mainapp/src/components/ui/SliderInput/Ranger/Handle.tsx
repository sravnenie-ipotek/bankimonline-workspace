import classNames from 'classnames/bind'
import React from 'react'
import { GetHandleProps } from 'react-compound-slider'
import { useTranslation } from 'react-i18next'

import styles from './Ranger.module.scss'

const cx = classNames.bind(styles)

interface HandleProps {
  handle: {
    id: string
    value: number
    percent: number
  }
  domain: [number, number]
  getHandleProps: GetHandleProps
}

const Handle: React.FC<HandleProps> = ({
  handle: { id, percent },
  getHandleProps,
}) => {
  const { i18n } = useTranslation()
  return (
    <div
      className={cx('handle', 'bg-accent-primary')}
      style={{
        left: `${percent}%`,
        marginLeft: i18n.language === 'he' ? '-12px' : '0px',
      }}
      {...getHandleProps(id)}
    />
  )
}

export default Handle
