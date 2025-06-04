import classNames from 'classnames/bind'
import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Caret } from '@assets/icons/Caret'
import { ServiceStatusError } from '@assets/icons/ServiceStatusIcons/ServiceStatusError'
import { ServiceStatusRequare } from '@assets/icons/ServiceStatusIcons/ServiceStatusRequare'
import { ServiceStatusSuccess } from '@assets/icons/ServiceStatusIcons/ServiceStatusSuccess'
import useTheme from '@src/hooks/useTheme'

import styles from './questionnaireAction.module.scss'

const cx = classNames.bind(styles)

const QuestionnaryAction: React.FC<{
  status: string
  children: ReactNode
  to: string
}> = ({ status, children, to }) => {
  const theme = useTheme()
  const succcessIconColor = theme?.colors?.success.success100
  const errorIconColor = theme?.colors?.error.error100
  const requareIconColor = theme?.colors?.textTheme.secondary

  return (
    <Link to={to} className={cx(styles.questionnaireAction)}>
      {status === 'accepted' && (
        <ServiceStatusSuccess color={succcessIconColor} />
      )}
      {status === 'nonAccepted' && (
        <ServiceStatusError color={errorIconColor} />
      )}
      {status === 'required' && (
        <ServiceStatusRequare color={requareIconColor} />
      )}
      <p className={cx(styles.text)}>{children}</p>
      <Caret size={16} color={requareIconColor} />
    </Link>
  )
}

export default QuestionnaryAction
