import * as React from 'react'

// Компонент раделитель
export default function Divider(props) {
  if (typeof props.active !== 'undefined') {
    return <div className={'step-divider active'}></div>
  }
  return <div className={'step-divider'}></div>
}
