import * as React from 'react'

import Divider from './Divider'
import MobileStep from './MobileStep'
import Step from './Step'

// Компонент для блока с шагами
export default function MobileStepsKit() {
  return (
    <div className="progressbar-mobile-container">
      <div className="progressbar-mobile-progressbar-mobile">
        <div
          className="progressbar-mobile-frame1410093263"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            display: 'grid',
            gap: '1rem',
          }}
        >
          <MobileStep title="תוכניות מתאימות" step="4" />
          <Divider />

          <Step title=" הַכנָסָה" step="3" />
          <Divider />

          <Step title="מידע אישי" step="2" active="true" />
          <Divider active="true" />

          <Step title="להלוות מחשבון" step="1" passed="true" />
        </div>
      </div>
    </div>
  )
}
