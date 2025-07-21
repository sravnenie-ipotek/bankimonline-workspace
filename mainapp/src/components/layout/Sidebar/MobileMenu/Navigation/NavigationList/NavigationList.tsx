import classNames from 'classnames/bind'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { IMenuItem } from '@components/layout/Sidebar/types/menuItem.ts'
import { useContentApi } from '@src/hooks/useContentApi'

import styles from './NavigationList.module.scss'

const cx = classNames.bind(styles)

interface NavigationListProps {
  items: IMenuItem[]
  title: string
  toggle: () => void
  onClose?: () => void
}

const NavigationList: FC<NavigationListProps> = ({ items, title, toggle, onClose }) => {
  const { t } = useTranslation()
  const { getContent } = useContentApi('navigation')
  
  const handleClick = () => {
    if (onClose) {
      onClose()
    }
  }
  
  return (
    <ul className={cx('list')}>
      <h3 className={cx('title')}>{getContent(title, t(title))}</h3>
      {items.slice(0, 1).map((item) => (
        <li key={item.title} onClick={toggle} className={cx('item')}>
          {item.title}
        </li>
      ))}
      {items.slice(1).map((item) => (
        <li key={item.title} className={cx('item')}>
          {item.isExternal ? (
            <a 
              href={item.path!} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleClick}
            >
              {item.title}
            </a>
          ) : (
            <Link to={item.path!} onClick={handleClick}>{item.title}</Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default NavigationList
