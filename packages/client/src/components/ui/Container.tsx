import React from 'react'

interface ContainerProps extends React.HTMLProps<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Container: React.FC<ContainerProps> = ({ children, className, ...rest }) => {
  const containerClasses = [
    'container',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} {...rest}>
      {children}
    </div>
  )
}

// CSS-in-JS styles to avoid external dependencies for now
const containerStyles = `
  .container {
    max-width: 70.63rem;
    margin: 0 auto;
  }

  @media (max-width: 1200px) {
    .container {
      padding: 0 20px;
    }
  }
`

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('container-styles')) {
  const style = document.createElement('style')
  style.id = 'container-styles'
  style.textContent = containerStyles
  document.head.appendChild(style)
}