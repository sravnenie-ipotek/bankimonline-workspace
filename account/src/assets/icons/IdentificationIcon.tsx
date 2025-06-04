import IconPropsType from './IconPropsType'

export const IdentificationIcon = ({ size = 20, color }: IconPropsType) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M10 13.125C11.3807 13.125 12.5 12.0057 12.5 10.625C12.5 9.24429 11.3807 8.125 10 8.125C8.61929 8.125 7.5 9.24429 7.5 10.625C7.5 12.0057 8.61929 13.125 10 13.125Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 14.9998C6.68669 14.4177 7.2529 13.9453 7.9038 13.6198C8.55469 13.2944 9.2724 13.125 10.0001 13.125C10.7278 13.125 11.4455 13.2944 12.0965 13.6197C12.7474 13.9451 13.3136 14.4176 13.7503 14.9997"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.25 16.875V3.125C16.25 2.77982 15.9702 2.5 15.625 2.5L4.375 2.5C4.02982 2.5 3.75 2.77982 3.75 3.125V16.875C3.75 17.2202 4.02982 17.5 4.375 17.5H15.625C15.9702 17.5 16.25 17.2202 16.25 16.875Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 5H12.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
