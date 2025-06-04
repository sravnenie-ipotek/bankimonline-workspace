import * as React from 'react'

import Divider from './Divider'
import Step from './Step'

// Компонент для блока с шагами
export default function StepsKit() {
  return (
    <div className={'steps'}>
      <div className={'steps-inner'}>
        <Step title="תוכניות מתאימות" step="4" />
        <Divider />

        <Step title=" הַכנָסָה" step="3" />
        <Divider />

        <Step title="מידע אישי" step="2" active="true" />
        <Divider active="true" />

        <Step title="להלוות מחשבון" step="1" passed="true" />
      </div>
    </div>
  )
}
