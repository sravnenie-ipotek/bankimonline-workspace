import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { useAppSelector } from '@src/hooks/store'
import useDisclosure from '@src/hooks/useDisclosure'

import styles from './documents.module.scss'

const cx = classNames.bind(styles)
export default function Documents() {
  const { t } = useTranslation()
  const [opened, { open, close }] = useDisclosure(false)
  const windowSize = useAppSelector((state) => state.windowSize.width)

  const navigate = useNavigate()

  return (
    <>
      {windowSize > 1024 && (
        <div className={cx('documents')}>
          <div className={cx('documents-title')}>{t('footer_legal')}</div>
          <div className={cx('documents-items')}>
            <a
              onClick={() => navigate('/terms')}
              className={cx('documents-items__links')}
            >
              {t('footer_legal_1')}
            </a>
            <a
              onClick={() => navigate('/privacy-policy')}
              className={cx('documents-items__links')}
            >
              {t('footer_legal_2')}
            </a>
            <a
              onClick={() => navigate('/cookie')}
              className={cx('documents-items__links')}
            >
              {t('footer_legal_3')}
            </a>
            <a
              onClick={() => navigate('/refund')}
              className={cx('documents-items__links')}
            >
              {t('footer_legal_4')}
            </a>
          </div>
        </div>
      )}
      {windowSize <= 1024 && (
        <div className={cx('documents', 'accordion-documents')}>
          <div
            onClick={opened ? close : open}
            className={cx('documents-title', 'accordion-title')}
          >
            {t('footer_legal')}
            <div
              className={cx('caret-down', `${opened && 'caret-down-opened'}`)}
            >
              <CaretDownIcon />
            </div>
          </div>
          <div
            className={cx('documents-items', 'accordion-items', {
              opened: opened,
            })}
          >
            <a href="/terms">{t('footer_legal_1')}</a>
            <a>{t('footer_legal_2')}</a>
            <a>{t('footer_legal_3')}</a>
            <a>{t('footer_legal_4')}</a>
          </div>
        </div>
      )}
    </>
  )
}
