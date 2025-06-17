import classnames from 'classnames/bind'
import { FC } from 'react'

import TitleElement from '../TitleElement/TitleElement.tsx'
import styles from './formattedInput.module.scss'

const cx = classnames.bind(styles)

interface TitleProps {
  title: string
  hasTooltip?: boolean
}

const Title: FC<TitleProps> = ({ title }) => {
  return (
    <div className={cx('custom-select-title')}>
      <div className={cx('title-container')}>
        <div className={cx('title-content')}>
          <TitleElement title={title} />
        </div>
      </div>
    </div>
  )
}

export default Title
