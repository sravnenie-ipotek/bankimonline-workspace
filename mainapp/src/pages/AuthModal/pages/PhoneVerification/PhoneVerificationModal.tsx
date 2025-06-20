import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

const PhoneVerificationModal = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleLoginClick = () => {
    dispatch(setActiveModal('auth'))
  }

  return (
    <div style={{ padding: '32px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#161616', marginBottom: '16px' }}>
          {t('enter_phone_number_login', 'Введите свой номер телефона, чтобы получить предложения от банков')}
        </h2>
        <p style={{ fontSize: '16px', color: '#666666', lineHeight: '1.5', margin: '0' }}>
          {t('confirm_phone_number_login', 'Подтвердите свой номер телефона, чтобы мы смогли прислать SMS с решением от банков. Мы гарантируем безопасность и сохранность ваших данных.')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <input 
          type="text" 
          placeholder="Имя Фамилия" 
          style={{ 
            padding: '12px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            fontSize: '16px'
          }} 
        />
        
        <input 
          type="tel" 
          placeholder="Номер телефона" 
          style={{ 
            padding: '12px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            fontSize: '16px'
          }} 
        />

        <button
          type="button"
          style={{
            width: '100%',
            height: '48px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          {t('continue', 'Продолжить')}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#666666', lineHeight: '1.4', margin: '0' }}>
            Нажимая кнопку "Продолжить" я принимаю условия{' '}
            <span style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>
              Пользовательского соглашения
            </span>
            {' '}и{' '}
            <span style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>
              Политики конфиденциальности
            </span>
          </p>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#666666' }}>
          <span>Уже являетесь нашим клиентом? </span>
          <span 
            style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px' }}
            onClick={handleLoginClick}
          >
            Войдите здесь
          </span>
        </div>
      </div>
    </div>
  )
}

export default PhoneVerificationModal 