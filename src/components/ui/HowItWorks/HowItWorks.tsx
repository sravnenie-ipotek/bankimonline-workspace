// Старый код. Файл заменён на index.tsx в этой же папке.
import { useTranslation } from 'react-i18next'

import './HowItWorks.css'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

// Компонент для бока на главной - как это работает
const HowItWorks = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]
  return (
    <div className={'how-it-works'}>
      <div className={'how-it-works-title-' + i18n.language}>
        {t('how_it_works')}
      </div>
      <div className={'how-it-works-inner'}>
        <Step1 />
        <Step2 />
        <Step3 />
      </div>
    </div>
  )
}
export default HowItWorks
