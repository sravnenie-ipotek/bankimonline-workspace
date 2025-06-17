import * as React from 'react'

import './Step.css'
import StepNo from './StepNo'
import Title from './Title'

// Компонент для блока с шагами
export default function Step(props) {
  if (typeof props.passed !== 'undefined') {
    return (
      <div className={'step passed'} style={props.sty}>
        <StepNo step={props.step} passed="true" />
        <Title title={props.title} />
      </div>
    )
  }

  if (typeof props.active !== 'undefined') {
    return (
      <div className={'step active'} style={props.sty}>
        <StepNo step={props.step} />
        <Title title={props.title} />
      </div>
    )
  }

  return (
    <div className={'step'} style={props.sty}>
      <StepNo step={props.step} />
      <Title title={props.title} />
    </div>
  )
}
