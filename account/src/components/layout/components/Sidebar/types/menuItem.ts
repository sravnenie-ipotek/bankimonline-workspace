import React from 'react'

import IconPropsType from '@assets/icons/IconPropsType.ts'

export type IMenuItem = {
  title: string
  path?: string
  icon: React.FC<IconPropsType>
}
