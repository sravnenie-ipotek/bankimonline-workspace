import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

const Step2: React.FC = () => {
  const { t } = useTranslation()
  const { getContent, loading, error } = useContentApi('home_page')

  return (
    <div className="how-it-works-step">
      <div className="how-it-works-texts">
        <div className="how-it-works-block">
          <img
            className="how-it-works-step__icon"
            alt={getContent('fill_form', 'fill_form')}
            src="/static/frame-14100932551.svg"
          />

          <div className="how-it-works-step__title">{getContent('fill_form', 'fill_form')}</div>
          <span className="how-it-works-step__text">{getContent('fill_form_description', 'fill_form_text')}</span>
          {/* Добавлен русский перевод в соответствии с макетом на экранах 890 - 1240. Так как JSON не позволяет писать комментарии, пишу здесь. */}
          <span className="how-it-works-step__text how-it-works-step__text_tablet">
            {getContent('fill_form_description', 'fill_form_text_tablet')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Step2
