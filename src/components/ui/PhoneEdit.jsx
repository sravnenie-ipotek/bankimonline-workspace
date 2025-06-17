import * as React from 'react'

import FormattedInput from '@components/ui/FormattedInput/FormattedInput'
import PhoneInput from '@components/ui/PhoneInput/PhoneInput'

// Компонент для редактирования телефона
export default function PhoneEdit(props) {
  const handleChange = (event) => {
    return null
  }

  return (
    <div
      className={'form-regular-control'}
      style={{
        marginLeft: '1rem',
        marginRight: '1rem',
      }}
    >
      <PhoneInput
        placeholder={'+ 935 234 3344'}
        name={'Phone'}
        handleChange={handleChange}
        disableCurrency={true}
      />
    </div>
  )
}
