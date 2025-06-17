import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Error } from '../Error'
import styles from './yesno.module.scss'

const cx = classNames.bind(styles)

// Компонент длл двух кнопок Да/нет

type PropTypes = {
  value: string | null
  onChange: (value: string) => void
  error?: string | boolean
}
const YesNo: React.FC<PropTypes> = ({ value, onChange, error }) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  return (
    <>
      <div className={cx('wrapper')}>
        <button
          className={cx(
            'button',
            { active: value === 'yes' },
            { error: error }
          )}
          type="button"
          onClick={() => onChange('yes')}
        >
          {t('yes')}
        </button>

        <button
          className={cx('button', { active: value === 'no' }, { error: error })}
          type="button"
          onClick={() => onChange('no')}
        >
          {t('no')}
        </button>
      </div>
      {error && <Error error={error} />}
    </>
  )
}

export default YesNo
