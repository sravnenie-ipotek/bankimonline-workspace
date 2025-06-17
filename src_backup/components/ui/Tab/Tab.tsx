import classNames from 'classnames/bind'
import React, { useState } from 'react'

import styles from './tab.module.scss'

const cx = classNames.bind(styles)

interface TabProps {
  data: {
    titles: React.ReactNode[] // заголовки
    content: React.ReactNode[] //содержимое
  }
}

const Tab: React.FC<TabProps> = ({ data }) => {
  const [nowView, setNowView] = useState(0)

  if (data.titles.length !== data.content.length)
    return <p>Количество заголовков и содержимого не совпадает</p>

  return (
    <div className={cx(styles.tabPlaya)}>
      <div className={cx(styles.tabPlate)}>
        <div className={cx(styles.tabTitles)}>
          {data.titles.map((title, index) => (
            <p
              key={index}
              className={cx(
                index === nowView ? styles.tabTitleActive : styles.tabTitle
              )}
              onClick={() => setNowView(index)}
            >
              {title}
            </p>
          ))}
        </div>
        <div className={cx(styles.tabsContent)}>{data.content[nowView]}</div>
      </div>
    </div>
  )
}

export default Tab
