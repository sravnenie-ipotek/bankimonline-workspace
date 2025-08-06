// Старый код. Файл заменён на index.tsx в этой же папке.
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import './HowItWorks.css'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

// Компонент для бока на главной - как это работает
const HowItWorks = () => {
  const { t, i18n } = useTranslation()
  const { getContent, loading, error } = useContentApi('home_page')
  
  return (
    <div className={'how-it-works'}>
      <div className={'how-it-works-title-' + i18n.language}>
        {getContent('how_it_works', 'how_it_works')}
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
