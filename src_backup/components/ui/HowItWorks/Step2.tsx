import { useTranslation } from 'react-i18next'

const Step2: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="how-it-works-step">
      <div className="how-it-works-texts">
        <div className="how-it-works-block">
          <img
            className="how-it-works-step__icon"
            alt={t('fill_form')}
            src="/static/frame-14100932551.svg"
          />

          <div className="how-it-works-step__title">{t('fill_form')}</div>
          <span className="how-it-works-step__text">{t('fill_form_text')}</span>
          {/* Добавлен русский перевод в соответствии с макетом на экранах 890 - 1240. Так как JSON не позволяет писать комментарии, пишу здесь. */}
          <span className="how-it-works-step__text how-it-works-step__text_tablet">
            {t('fill_form_text_tablet')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Step2
