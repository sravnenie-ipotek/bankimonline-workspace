import React from 'react'
import { useTranslation } from 'react-i18next'

const Step1: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="how-it-works-step">
      <div className="how-it-works-texts">
        <div className="how-it-works-block">
          <img
            className="how-it-works-step__icon"
            alt={t('mortgage_calculator')}
            src="/static/frame-14100932552.svg"
          />

          <div className="how-it-works-step__title">
            {t('mortgage_calculator')}
          </div>
          <span className="how-it-works-step__text">
            {t('mortgage_calculator_text')}
          </span>
          {/* Добавлен опциональный блок для единства кода с другими блоками (Step2, Step3) и возможности добавить перевод в соответствии с макетом на экранах 890 - 1240. Так как JSON не позволяет писать комментарии, пишу здесь. */}
          <span className="how-it-works-step__text how-it-works-step__text_tablet">
            {t('mortgage_calculator_text')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Step1
