import cn from 'classnames'
import { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import styles from './Button.module.scss'

interface IButton
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant: TVariant
}

type TVariant = 'primary' | 'secondary' | 'disabled'

export function Button({ children, variant, disabled, ...props }: IButton) {
  return (
    <button
      disabled={disabled}
      {...props}
      className={cn(
        styles.button,
        {
          primary: [styles.primary],
          secondary: [styles.secondary],
          disabled: [styles.disabled],
        }[disabled ? 'disabled' : variant]
      )}
    >
      {children}
    </button>
  )
}
