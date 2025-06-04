import IconPropsType from '@assets/icons/IconPropsType.ts'

export const BankLeumi = ({ size = 20, ...props }: IconPropsType) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <circle cx="10" cy="10" r="10" fill="white" />
      <rect x="4" y="5" width="12" height="5" fill="#00B0F0" />
      <rect x="4" y="11" width="12" height="5" fill="#2957A5" />
    </svg>
  )
}
