import React from 'react'
import { useTranslation } from 'react-i18next'

import './Terms.css'

const Body: React.FC = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  return (
    <div className={'home'} style={{ paddingTop: '0' }}>
      <div className={'terms-body'}>
        <div className={'terms-actions'}>
          <h1
            style={{
              fontSize: '3rem',
              marginBottom: '45px',
              display: 'flex',
            }}
          >
            {t('terms_heading')}
          </h1>
          <p style={{ paddingBottom: '3rem', whiteSpace: 'pre-wrap' }}>
            {t('terms_text')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Body