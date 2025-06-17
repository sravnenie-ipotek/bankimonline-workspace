import classNames from 'classnames/bind'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import { IMenuItem } from '@components/layout/Sidebar/types/menuItem.ts'

import styles from './SubSidebar.module.scss'

interface PropTypes {
  isOpen?: boolean
  isOpenMainMenu?: boolean
  items: IMenuItem[]
  onCloseMainMenu: () => void
}

const cx = classNames.bind(styles)

const SubSidebar: FC<PropTypes> = ({
  items,
  isOpen,
  isOpenMainMenu,
  onCloseMainMenu,
}) => {
  return (
    <nav
      className={cx('container', {
        container_open: isOpen && isOpenMainMenu,
      })}
    >
      <ul className={cx('list')}>
        {items.map((item) => (
          <li key={item.title} className={cx('item')}>
            <Link to={item.path!} onClick={onCloseMainMenu}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SubSidebar
