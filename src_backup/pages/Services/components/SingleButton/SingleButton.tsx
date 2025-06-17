import classNames from 'classnames/bind'
import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Button } from '@components/ui/ButtonUI'

import styles from './singleButton.module.scss'

const cx = classNames.bind(styles)

const SingleButton = () => {
  const { t } = useTranslation()
  const { isValid, handleSubmit } = useFormikContext()

  return (
    <div className={cx('submit-btn')}>
      <div className={cx('wrapper')}>
        <div className={cx('buttons')}>
          <Button
            isDisabled={!isValid}
            onClick={handleSubmit as () => void}
            size="smallLong"
            type="button"
          >
            {t('button_next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SingleButton
