import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { SuccessIcon } from '@assets/icons/SuccessIcon'
import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { closeModal } from '@src/pages/Services/slices/modalSlice'

import styles from './success.module.scss'

const cx = classNames.bind(styles)

const Success = () => {
  const { t, i18n } = useTranslation()

  const dispatch = useAppDispatch()

  return (
    <div className={cx('success')}>
      <div className={cx('success-header')}>
        <SuccessIcon size={80} color="#FBE54D" />
        <h3 className={cx('success-title')}>{t('success_restore_password')}</h3>
      </div>
      <div className={cx('success-footer')}>
        <Button
          onClick={() => dispatch(setActiveModal('auth'))}
          className={cx('success-button')}
        >
          {t('enter')}
        </Button>
        <BackButton
          handleClick={() => dispatch(closeModal())}
          className={cx('success-button')}
          title={t('close')}
        />
      </div>
    </div>
  )
}

export default Success
