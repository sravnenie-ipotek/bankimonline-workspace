const CalendarBlankIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...props}
    >
      <path
        fill="#FBE54D"
        d="M16.25 2.5h-1.875v-.625a.625.625 0 1 0-1.25 0V2.5h-6.25v-.625a.625.625 0 0 0-1.25 0V2.5H3.75A1.25 1.25 0 0 0 2.5 3.75v12.5a1.25 1.25 0 0 0 1.25 1.25h12.5a1.25 1.25 0 0 0 1.25-1.25V3.75a1.25 1.25 0 0 0-1.25-1.25ZM5.625 3.75v.625a.625.625 0 0 0 1.25 0V3.75h6.25v.625a.625.625 0 1 0 1.25 0V3.75h1.875v2.5H3.75v-2.5h1.875Zm10.625 12.5H3.75V7.5h12.5v8.75Z"
      />
    </svg>
  )
}

export default CalendarBlankIcon
