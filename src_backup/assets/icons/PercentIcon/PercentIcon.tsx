import React from 'react'

type TypeProps = {
  color?: string
}

const PercentIcon: React.FC<TypeProps> = ({ color = '#FBE54D', ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...props}
    >
      <path
        fill={color}
        d="m16.067 4.816-11.25 11.25a.625.625 0 1 1-.884-.885l11.25-11.25a.625.625 0 1 1 .884.884ZM3.948 7.925a2.813 2.813 0 1 1 3.978-3.977 2.813 2.813 0 0 1-3.978 3.977Zm.427-1.988A1.562 1.562 0 1 0 7.5 5.935a1.562 1.562 0 0 0-3.125.002Zm12.5 8.125a2.812 2.812 0 1 1-5.625 0 2.812 2.812 0 0 1 5.625 0Zm-1.25 0a1.563 1.563 0 1 0-3.125 0 1.563 1.563 0 0 0 3.125 0Z"
      />
    </svg>
  )
}

export default PercentIcon
