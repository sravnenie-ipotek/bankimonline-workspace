import React from 'react'

import TitleElement from '../TitleElement/TitleElement.tsx'

interface PropTypes {
  title: string
  hasTooltip?: boolean
}

// Компонент подписи к выпадающему списку
const Title: React.FC<PropTypes> = (props) => {
  return (
    <div className={'custom-select-title'}>
      <TitleElement title={props.title} />
    </div>
  )
}

export default Title
