import IconPropsType from '@assets/icons/IconPropsType.ts'

export const MagnifyPlus = ({ size = 17, ...props }: IconPropsType) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.75 7.75H9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 5.75V9.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 13C10.6495 13 13 10.6495 13 7.75C13 4.85051 10.6495 2.5 7.75 2.5C4.85051 2.5 2.5 4.85051 2.5 7.75C2.5 10.6495 4.85051 13 7.75 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.4609 11.4629L14.4985 14.5004"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
