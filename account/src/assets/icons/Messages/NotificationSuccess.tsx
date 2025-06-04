import IconPropsType from '@assets/icons/IconPropsType.ts'

export const NotificationSuccess = ({ size = 24, ...props }: IconPropsType) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_d_25201_130858)">
        <path
          d="M14 2.25C12.0716 2.25 10.1866 2.82183 8.58319 3.89317C6.97982 4.96451 5.73013 6.48726 4.99218 8.26884C4.25422 10.0504 4.06114 12.0108 4.43735 13.9021C4.81355 15.7934 5.74215 17.5307 7.10571 18.8943C8.46928 20.2579 10.2066 21.1865 12.0979 21.5627C13.9892 21.9389 15.9496 21.7458 17.7312 21.0078C19.5127 20.2699 21.0355 19.0202 22.1068 17.4168C23.1782 15.8134 23.75 13.9284 23.75 12C23.7473 9.41498 22.7192 6.93661 20.8913 5.10872C19.0634 3.28084 16.585 2.25273 14 2.25ZM18.2806 10.2806L13.0306 15.5306C12.961 15.6004 12.8783 15.6557 12.7872 15.6934C12.6962 15.7312 12.5986 15.7506 12.5 15.7506C12.4014 15.7506 12.3038 15.7312 12.2128 15.6934C12.1218 15.6557 12.039 15.6004 11.9694 15.5306L9.71938 13.2806C9.57865 13.1399 9.49959 12.949 9.49959 12.75C9.49959 12.551 9.57865 12.3601 9.71938 12.2194C9.86011 12.0786 10.051 11.9996 10.25 11.9996C10.449 11.9996 10.6399 12.0786 10.7806 12.2194L12.5 13.9397L17.2194 9.21937C17.2891 9.14969 17.3718 9.09442 17.4628 9.0567C17.5539 9.01899 17.6515 8.99958 17.75 8.99958C17.8486 8.99958 17.9461 9.01899 18.0372 9.0567C18.1282 9.09442 18.2109 9.14969 18.2806 9.21937C18.3503 9.28906 18.4056 9.37178 18.4433 9.46283C18.481 9.55387 18.5004 9.65145 18.5004 9.75C18.5004 9.84855 18.481 9.94613 18.4433 10.0372C18.4056 10.1282 18.3503 10.2109 18.2806 10.2806Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_25201_130858"
          x="-2"
          y="0"
          width="32"
          height="32"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_25201_130858"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_25201_130858"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  )
}
