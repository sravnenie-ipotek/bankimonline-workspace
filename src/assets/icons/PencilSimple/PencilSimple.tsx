const PensilSimple = (props: React.SVGProps<SVGSVGElement>) => {
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
        d="m21.31 6.88-4.188-4.19a1.5 1.5 0 0 0-2.122 0L3.44 14.25A1.487 1.487 0 0 0 3 15.312v4.19A1.5 1.5 0 0 0 4.5 21h4.19a1.487 1.487 0 0 0 1.06-.44l11.56-11.56a1.5 1.5 0 0 0 0-2.122ZM8.69 19.5H4.5v-4.189l8.25-8.25 4.19 4.19-8.25 8.25ZM18 10.19 13.81 6l2.25-2.25 4.19 4.19L18 10.19Z"
      />
    </svg>
  )
}

export default PensilSimple
