import classNames from 'classnames/bind'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import IconPropsType from '@assets/icons/IconPropsType'
import { useAppSelector } from '@src/hooks/store'

import styles from './dropdownNavigationItem.module.scss'

type DropdownLinkProps = {
  title: string
  path: string
  icon: FC<IconPropsType>
}

const cx = classNames.bind(styles)

const DropdownNavigationItem: FC<DropdownLinkProps> = ({
  title,
  path,
  icon: IconComponent,
}) => {
  const position = useAppSelector((store) => store.language.direction)
  const navigate = useNavigate()

  const isRussian = position === 'ltr'
  return (
    <div
      className={cx('root', !isRussian && 'rtl')}
      onClick={() => navigate(path)}
    >
      <IconComponent color={'#C7C7C7'} /> <span>{title}</span>
    </div>
  )
}

export default DropdownNavigationItem
