import React from 'react'
import { Link } from 'react-router-dom'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  as?: React.ElementType
  to?: string
  [key: string]: any // For additional props like Link props
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className,
  variant = 'primary',
  size = 'medium',
  as: Component = 'button',
  to,
  ...props
}) => {
  // Simple className building without classnames library
  const baseClasses = `btn btn--${variant} btn--${size} ${disabled ? 'btn--disabled' : ''}`
  
  const combinedClassName = [baseClasses, className].filter(Boolean).join(' ')

  // If 'as' prop is Link or to prop is provided, render as Link
  if (Component === Link || to) {
    return (
      <Link
        to={to || '#'}
        className={combinedClassName}
        {...props}
      >
        {children}
      </Link>
    )
  }

  // Otherwise render as the specified component (button by default)
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {children}
    </Component>
  )
}