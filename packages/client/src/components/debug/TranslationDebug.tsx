import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Debug component to test translations
 */
export const TranslationDebug: React.FC = () => {
  const { t, i18n, ready } = useTranslation()

  const testKeys = [
    'fill_form',
    'title_compare',
    'fill_form_text',
    'app_name',
    'compare_in_5mins',
    'calculate_mortgage_is_medinsurance',
    'yes',
    'no',
    'calculate_mortgage_is_foreigner', 
    'calculate_mortgage_children18'
  ]

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Translation Debug</h4>
      <p>Language: {i18n.language}</p>
      <p>Ready: {ready ? 'Yes' : 'No'}</p>
      <p>Initialized: {i18n.isInitialized ? 'Yes' : 'No'}</p>
      <p>Resources loaded: {Object.keys(i18n.store.data).join(', ')}</p>
      
      <h5>Test Translations:</h5>
      {testKeys.map(key => (
        <div key={key}>
          <strong>{key}:</strong> {t(key)}
        </div>
      ))}
      
      <button 
        onClick={() => {
          })
        }}
        style={{ marginTop: '10px', padding: '5px' }}
      >
        Log Debug Info
      </button>
    </div>
  )
}

export default TranslationDebug