import React, { CSSProperties } from 'react'

export default interface IconPropsType extends React.SVGProps<SVGSVGElement> {
  size?: number
  color?: string
  stroke?: string
  style?: CSSProperties
}
