import IconPropsType from '@assets/icons/IconPropsType.ts'

export const BankHapoalim = ({ size = 20, ...props }: IconPropsType) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="10" cy="10" r="10" fill="white" />
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M8.4487 4.65979C8.98961 4.04038 9.3973 3.75156 10.3434 4.26355L15.0284 6.76405C16.1127 7.35466 16.2252 8.36748 15.6826 9.0842L11.075 15.3516C10.2685 16.4438 9.41472 15.959 8.83096 15.3339L4.3837 10.623C3.94754 10.1476 3.83836 9.79341 4.29221 9.27909L8.4487 4.65979Z"
        fill="#C00000"
      />
    </svg>
  )
}
