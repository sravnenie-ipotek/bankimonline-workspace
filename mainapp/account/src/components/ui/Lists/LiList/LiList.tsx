import classNames from 'classnames/bind'
import React from 'react'

import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './LilList.module.scss'

interface LiList {
  children: React.ReactNode
  additionalStyles?: string | string[]
}

const cx = classNames.bind(styles)

const LiList: React.FC<LiList> = ({ children, additionalStyles }) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const isRussian = currentFont === 'font-ru'

  return (
    <li>
      <span className={cx(isRussian ? 'ml-2' : 'mr-2', additionalStyles)}>
        {children}
      </span>
    </li>
  )
}

export default LiList
