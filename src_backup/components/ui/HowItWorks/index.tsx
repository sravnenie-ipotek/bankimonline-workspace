import { useTranslation } from 'react-i18next'

import './HowItWorks.css'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

// Компонент для бока на главной - Как это работает
const HowItWorks = () => {
  const { t } = useTranslation()
  return (
    <div className="how-it-works">
      <div className="how-it-works__title">{t('how_it_works')}</div>
      <div className="how-it-works-inner">
        {/* аттрибут data-number хранит данные для создания псевдо-элемента с порядковым номером шага */}
        {/* обёртки для шагов вынесены в компонент родителя, чтобы не создавать излишней вложенности у дочерних компонентов */}
        <div className="how-it-works-inner__step-wrapper" data-number="1">
          <Step1 />
        </div>
        <div className="how-it-works-inner__step-wrapper" data-number="2">
          <Step2 />
        </div>
        <div className="how-it-works-inner__step-wrapper" data-number="3">
          <Step3 />
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
