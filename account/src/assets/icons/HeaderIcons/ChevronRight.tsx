import IconPropsType from '@assets/icons/IconPropsType.ts'

export const ChevronRight = ({ size = 24, ...props }: IconPropsType) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
    >
      <path
        d="M6.7 9.7a.948.948 0 0 1 .7-.275c.284 0 .517.091.7.275l3.9 3.9 3.9-3.9a.948.948 0 0 1 .7-.275c.284 0 .517.091.7.275a.948.948 0 0 1 .275.7.948.948 0 0 1-.275.7l-4.6 4.6c-.1.1-.208.17-.325.213a1.116 1.116 0 0 1-.375.062c-.133 0-.258-.02-.375-.062a.883.883 0 0 1-.325-.213l-4.6-4.6a.948.948 0 0 1-.275-.7c0-.284.092-.517.275-.7Z"
        fill="currentColor"
        {...props}
      />
    </svg>
  )
}
