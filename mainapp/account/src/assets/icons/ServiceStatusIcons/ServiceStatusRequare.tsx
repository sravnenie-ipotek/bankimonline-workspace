import IconPropsType from '@assets/icons/IconPropsType.ts'

export const ServiceStatusRequare = ({
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
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" {...props} />
    </svg>
  )
}
