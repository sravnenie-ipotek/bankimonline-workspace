import React from 'react'

import TitleElement from '../TitleElement/TitleElement.tsx'

// Компонент подписи к элементу ввода
export default function Title(props) {
  return (
    <div className={'custom-select-title'}>
      <div
        style={{
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.38rem',
        }}
      >
        <TitleElement title={props.title} hasTooltip={props.hasTooltip} />
      </div>
    </div>
  )
}
