import React from 'react'
import { useTranslation } from 'react-i18next'

// Компонент кнопки под полем ввода
const InfoButton: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        textAlign: 'left',
        color: '#fff',
        maxWidth: '514px',
        margin: '0',
      }}
    >
      <div
        style={{
          borderRadius: '8px',
          border: '1px dashed #46a08f',
          display: 'flex',
          flexDirection: 'row',
          padding: '0.94rem 1.5rem',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '0.75rem',
          paddingRight: '0',
          marginLeft: '1rem',
          marginRight: '1rem',
        }}
      >
        <img
          style={{
            position: 'relative',
            marginRight: '1rem',
            width: '1.5rem',
            height: '1.5rem',
          }}
          alt=""
          src="/static/calculate-credit/shieldcheck1.svg"
        />
        <div
          style={{
            position: 'relative',
            lineHeight: '140%',
            whiteSpace: 'break-spaces',
            width: '505px',
            maxWidth: '505px',
          }}
        >
          <span>{t('third_persons')}</span>
        </div>
      </div>
    </div>
  )
}

export default InfoButton
