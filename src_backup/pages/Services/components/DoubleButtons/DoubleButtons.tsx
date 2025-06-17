import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@components/ui/ButtonUI'

import styles from './doubleButtons.module.scss'

const cx = classNames.bind(styles)

const DoubleButtons: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { handleSubmit, isValid } = useFormikContext()

  return (
    <div className={cx('doubleButtons')}>
      <div className={cx('wrapper')}>
        <div className={cx('buttons')}>
          <Button
            variant="modalBase"
            type="submit"
            onClick={() => navigate(-1)}
            size="full"
          >
            {t('button_back')}
          </Button>
          <Button
            type="submit"
            isDisabled={!isValid}
            onClick={handleSubmit as () => void}
            size="full"
          >
            {t('button_next_save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DoubleButtons
