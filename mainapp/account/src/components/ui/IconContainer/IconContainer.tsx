import classNames from 'classnames/bind'
import { FC, ReactNode } from 'react'

import styles from './iconContainer.module.scss'

type IconContainerVariant = 'rounded'
type IconContainerSize = 'small' | 'medium' | 'large'

type IconContainerProps = {
  variant?: IconContainerVariant
  size?: IconContainerSize
  bgColor: string
  children: ReactNode
}
const cx = classNames.bind(styles)

const IconContainer: FC<IconContainerProps> = ({
  variant = 'rounded',
  size = 'medium',
  bgColor = 'gray',
  children,
}) => {
  const buttonClasses = {
    [variant]: true, // Добавление css-класса, соответствующего выбранному variant
    [size]: true, // Добавление css-класса, соответствующего выбранному размеру
    [bgColor]: true, //Добавление css-класса, соответствующего выбранному цвету
    [styles.iconContainer]: true, // Добавление базового css-класса кнопки
  }
  return <div className={cx(buttonClasses)}>{children}</div>
}

export default IconContainer
