import React from 'react'

interface SuccessIconProps {
  size?: number
  color?: string
  className?: string
}

export const SuccessIcon: React.FC<SuccessIconProps> = ({ 
  size = 24, 
  color = '#4CAF50',
  className 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Success"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        stroke="none"
      />
      <path
        d="M8.5 12.5L11 15L15.5 9.5"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}