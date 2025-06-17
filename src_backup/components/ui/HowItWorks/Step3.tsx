import React from 'react'
import { useTranslation } from 'react-i18next'

const Step3: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="how-it-works-step">
      <div className="how-it-works-texts">
        <div className="how-it-works-block">
          <img
            className="how-it-works-step__icon"
            alt={t('get_program')}
            src="/static/frame-1410093255.svg"
          />

          <div className="how-it-works-step__title">{t('get_program')}</div>
          <span className="how-it-works-step__text">
            {t('get_program_text')}
          </span>
          {/* Добавлен русский перевод в соответствии с макетом на экранах 890 - 1240. Так как JSON не позволяет писать комментарии, пишу здесь. */}
          <span className="how-it-works-step__text how-it-works-step__text_tablet">
            {t('get_program_text_tablet')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Step3
