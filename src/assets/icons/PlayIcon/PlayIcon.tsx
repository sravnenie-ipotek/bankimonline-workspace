const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <path
        fill="#fff"
        d="M21.788 10.734 8.28 2.47a1.5 1.5 0 0 0-2.075.516A1.487 1.487 0 0 0 6 3.738v16.525a1.494 1.494 0 0 0 1.5 1.487c.277 0 .548-.076.784-.22l13.504-8.263a1.481 1.481 0 0 0 0-2.531v-.002ZM7.5 20.244V3.75L20.984 12 7.5 20.245Z"
      />
    </svg>
  )
}

export default PlayIcon
