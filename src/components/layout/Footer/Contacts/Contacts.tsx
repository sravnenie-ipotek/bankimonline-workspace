import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { CaretDownIcon } from '@assets/icons/CaretDownIcon'
import { useAppSelector } from '@src/hooks/store'
import useDisclosure from '@src/hooks/useDisclosure'

// Компонент блока контактов
import styles from './contacts.module.scss'

const cx = classNames.bind(styles)
export default function Contacts() {
  const { t } = useTranslation()
  const [opened, { open, close }] = useDisclosure(false)
  const windowSize = useAppSelector((state) => state.windowSize.width)

  return (
    <>
      {windowSize > 1024 && (
        <div className={cx('contacts')}>
          <div className={cx('contacts-title')}>{t('footer_contacts')}</div>
          <div className={cx('contacts-items')}>
            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/envelopesimple.svg" />
              <a
                href="mailto:Bankimonline@mail.com"
                target="_blank"
                rel="noreferrer"
              >
                Bankimonline@mail.com
              </a>
            </div>

            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/phone.svg" />
              <a
                href="https://wa.me/972537162235"
                target="_blank"
                rel="noreferrer"
              >
                +972 53-716-2235
              </a>
            </div>
            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/iconwhatsapp.svg" />
              <a
                href="https://wa.me/972537162235"
                target="_blank"
                rel="noreferrer"
              >
                {t('footer_writeus')}
              </a>
            </div>
          </div>
        </div>
      )}
      {windowSize <= 1024 && (
        <div className={cx('contacts', 'accordion-contacts')}>
          <div
            onClick={opened ? close : open}
            className={cx('contacts-title', 'accordion-title')}
          >
            {t('footer_contacts')}
            <div
              className={cx('caret-down', `${opened && 'caret-down-opened'}`)}
            >
              <CaretDownIcon />
            </div>
          </div>
          <div
            className={cx('contacts-items', 'accordion-items', {
              opened: opened,
            })}
          >
            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/envelopesimple.svg" />
              <a
                href="mailto:Bankimonline@mail.com"
                target="_blank"
                rel="noreferrer"
              >
                Bankimonline@mail.com
              </a>
            </div>

            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/phone.svg" />
              <a
                href="https://wa.me/972537162235"
                target="_blank"
                rel="noreferrer"
              >
                +972 53-716-2235
              </a>
            </div>
            <div className={cx('contacts-items__text')}>
              <img alt="" src="/static/iconwhatsapp.svg" />
              <a
                href="https://wa.me/972537162235"
                target="_blank"
                rel="noreferrer"
              >
                {t('footer_writeus')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
