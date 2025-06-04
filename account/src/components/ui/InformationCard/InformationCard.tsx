import classNames from 'classnames/bind'
import React from 'react'
import { Link } from 'react-router-dom'

import { PencilSimple } from '@assets/icons/PencilSimple'
import useTheme from '@src/hooks/useTheme'

import styles from './informationCard.module.scss'

interface InformationCardProps {
  link: string // ссылка на редактирование
  title: string // заголовок
  stringTitle: string // заголовок даннаых
  stringData: string // данные
}

const InformationCard: React.FC<InformationCardProps> = ({
  link,
  title,
  stringTitle,
  stringData,
}) => {
  const cx = classNames.bind(styles)

  const theme = useTheme()
  const primaryIconColor = theme?.colors?.accent.primary

  return (
    <div className={cx(styles.informationCardPlate)}>
      <div className={cx(styles.informationCardTopLine)}>
        <p className={cx(styles.informationCardTitleText)}>{title}</p>
        <Link to={link} className={cx(styles.pencilIcon)}>
          <PencilSimple size={24} color={primaryIconColor} />
        </Link>
      </div>
      <div className={cx(styles.informationCardBottomLine)}>
        <p className={cx(styles.informationCardDataText, 'mb-[9px]')}>
          {stringTitle}
        </p>
        <p className={cx(styles.informationCardDataText)}>{stringData}</p>
      </div>
    </div>
  )
}

export default InformationCard
