const ArrowSquareOut = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <path
        fill="#FBE54D"
        d="M21 9.75a.75.75 0 1 1-1.5 0V5.561l-6.218 6.22a.75.75 0 1 1-1.062-1.062L18.44 4.5H14.25a.75.75 0 1 1 0-1.5h6a.75.75 0 0 1 .75.75v6ZM17.25 12a.75.75 0 0 0-.75.75v6.75h-12v-12h6.75a.75.75 0 1 0 0-1.5H4.5A1.5 1.5 0 0 0 3 7.5v12A1.5 1.5 0 0 0 4.5 21h12a1.5 1.5 0 0 0 1.5-1.5v-6.75a.75.75 0 0 0-.75-.75Z"
      />
    </svg>
  )
}

export default ArrowSquareOut
