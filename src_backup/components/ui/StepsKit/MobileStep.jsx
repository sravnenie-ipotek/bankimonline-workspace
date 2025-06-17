import * as React from 'react'
import { useTranslation } from 'react-i18next'

import './StepsMobile.css'

// Компонент для блока с шагами
export default function MobileStep(props) {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  return (
    <div className="progressbar-mobile-steptitle-mobile" style={props.sty}>
      <div className="progressbar-mobile-step">
        {props.active ? (
          <img
            src="/static/mobile-steps/ellipse66i085-cd49-200h.png"
            alt="Ellipse66I085"
            className="progressbar-mobile-ellipse66"
          />
        ) : props.passed ? (
          <img
            src="/static/mobile-steps/passed.svg"
            alt="Ellipse67I085"
            className="progressbar-mobile-ellipse67"
          />
        ) : (
          <img
            src="/static/mobile-steps/ellipse67i085-ik0a-200h.png"
            alt="Ellipse67I085"
            className="progressbar-mobile-ellipse67"
          />
        )}

        {props.active ? (
          <span className="progressbar-mobile-text">{props.step}</span>
        ) : props.passed ? (
          ''
        ) : (
          <span className="progressbar-mobile-text03">{props.step}</span>
        )}
      </div>
      <span className="progressbar-mobile-text01 Paragraph(Inter)12500-Medium">
        <span>{props.title}</span>
      </span>
    </div>
  )
  //   <div className={'steps'}>
  //     <div className={'steps-inner'}>
  //       <Step title={t('calculate_mortgage_calculator')} step='1' active='true' />
  //       <Divider />
  //       <Step title={t('calculate_mortgage_anketa_m')} step='2' />
  //       <Divider />
  //       <Step title={t('calculate_mortgage_income_m')} step='3' />
  //       <Divider />
  //       <Step title={t('calculate_mortgage_programs_m')} step='4' />
  //     </div>
  //   </div>
  // );
}
