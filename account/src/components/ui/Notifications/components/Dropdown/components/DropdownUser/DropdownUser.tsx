import classNames from 'classnames/bind'
import { FC } from 'react'

import { CaretDown } from '@assets/icons/CaretDown'
import { User } from '@assets/icons/User'
import { IconContainer } from '@src/components/ui/IconContainer'
import { useWindowResize } from '@src/hooks/useWindowResize'

import styles from './dropdownUser.module.scss'

type DropdownUserProps = {
  name?: string
  lastName?: string
  isOpen: boolean
}

const cx = classNames.bind(styles)

export const DropdownUser: FC<DropdownUserProps> = ({
  name,
  lastName,
  isOpen,
}) => {
  const { isDesktop, isTablet } = useWindowResize()

  return (
    <div className={cx('root')}>
      <IconContainer bgColor={'gray'}>
        <User color={'white'} />
      </IconContainer>

      {(isDesktop || isTablet) && (
        <div className={cx('bold')}>
          {name} {lastName}
        </div>
      )}
      {(isDesktop || isTablet) && (
        <div
          className={cx(
            'dropdown_caret',
            isOpen ? 'caret_open' : 'caret_close'
          )}
        >
          <CaretDown color="white" size={24} />
        </div>
      )}
    </div>
  )
}
