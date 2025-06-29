import { useTranslation } from 'react-i18next'

import './HowItWorks.css'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

// Компонент для бока на главной - Как это работает
type HowItWorksProps = {
  onStep1Click?: () => void  // Действие #12: How it works - step 1
  onStep2Click?: () => void  // Действие #30: How it works - step 2  
  onStep3Click?: () => void  // Действие #31: How it works - step 3
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onStep1Click, onStep2Click, onStep3Click }) => {
  const { t } = useTranslation()
  return (
    <div className="how-it-works">
      <div className="how-it-works__title">{t('how_it_works')}</div>
      <div className="how-it-works-inner">
        {/* аттрибут data-number хранит данные для создания псевдо-элемента с порядковым номером шага */}
        {/* обёртки для шагов вынесены в компонент родителя, чтобы не создавать излишней вложенности у дочерних компонентов */}
        <div 
          className="how-it-works-inner__step-wrapper" 
          data-number="1"
          onClick={onStep1Click}
          style={{ cursor: onStep1Click ? 'pointer' : 'default' }}
        >
          <Step1 />
        </div>
        <div 
          className="how-it-works-inner__step-wrapper" 
          data-number="2"
          onClick={onStep2Click}
          style={{ cursor: onStep2Click ? 'pointer' : 'default' }}
        >
          <Step2 />
        </div>
        <div 
          className="how-it-works-inner__step-wrapper" 
          data-number="3"
          onClick={onStep3Click}
          style={{ cursor: onStep3Click ? 'pointer' : 'default' }}
        >
          <Step3 />
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
