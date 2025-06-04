import * as React from 'react'

// Компонент разделитель для мобильной верстки
export default function MobDivider(props) {
  if (typeof props.active !== 'undefined') {
    return <div className={'mob-step-divider active'}></div>
  }
  return <div className={'mob-step-divider'}></div>
}
