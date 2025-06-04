import classNames from 'classnames/bind'
import React from 'react'
import { Link } from 'react-router-dom'

import { PencilSimple } from '@assets/icons/PencilSimple'
import useRoute from '@src/hooks/useRoute'

import styles from './mortgageCardDetailsTitle.module.scss'

const cx = classNames.bind(styles)
const MortgageCardDetailsTitle: React.FC<{
  title: string
  primaryIconColor?: string
}> = ({ title, primaryIconColor }) => {
  const { nav } = useRoute()
  return (
    <div className={cx(styles.mortgageCardTitleWrapper)}>
      <p className={cx(styles.mortgageCardTitle)}>{title}</p>
      <Link to={nav('editService')} className={cx(styles.pencilIcon)}>
        <PencilSimple color={primaryIconColor} />
      </Link>
    </div>
  )
}

export default MortgageCardDetailsTitle
