import IconPropsType from '@assets/icons/IconPropsType.ts'

export const ServiceStatusSuccess = ({
  size = 14,
  ...props
}: IconPropsType) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="7" fill="currentColor" {...props} />
      <path
        d="M11.125 4.37524L5.875 9.62501L3.25 7.00024"
        stroke="white"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
