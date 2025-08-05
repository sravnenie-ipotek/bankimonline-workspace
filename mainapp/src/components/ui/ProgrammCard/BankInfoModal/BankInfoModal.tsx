import classNames from 'classnames/bind'
import i18next from 'i18next'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { Modal } from '../../Modal'
import { Tabs } from '../../Tabs'
import styles from './bankInfo.module.scss'

const cx = classNames.bind(styles)

type BankInfoModalProps = {
  isVisible: boolean
  onClose: () => void
  title: string
  description: string
  conditionFinance: string
  conditionPeriod: string
  conditionBid: string
}

const BankInfoModal: React.FC<BankInfoModalProps> = ({
  isVisible,
  onClose,
  title,
  description,
  conditionFinance,
  conditionPeriod,
  conditionBid,
}) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('bank_offers')
  const [activeTab, setActiveTab] = useState('description')
  
  const tabs = [
    {
      value: 'description',
      label: getContent('description', 'description'),
    },
    {
      value: 'condition',
      label: getContent('condition', 'condition'),
    },
  ]

  const handleChangeTab = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Modal isVisible={isVisible} onCancel={onClose}>
      <div className={cx('modal')}>
        <div className={cx('modal-header')}>
          <div className={cx('modal-header__title')}>{title}</div>
          <Tabs handleChange={handleChangeTab} tabs={tabs} tab={activeTab} />
        </div>
        <div>
          {activeTab === 'description' && (
            <div className={cx('modal-content')}>
              <p className={cx('modal-content__text')}>{description}</p>
            </div>
          )}
          {activeTab === 'condition' && (
            <div className={cx('modal-content')}>
              <div className={cx('modal-content__row')}>
                <p className={cx('modal-content__condition')}>
                  {t('calculate_mortgage_parameters_initial')}
                </p>
                <div className={cx('modal-content__title')}>
                  <span className={cx('ellipse')}></span>
                  <p>{conditionFinance}</p>
                </div>
              </div>
              <div className={cx('modal-content__row')}>
                <p className={cx('modal-content__condition')}>
                  {t('mortgage_term')}
                </p>
                <div className={cx('modal-content__title')}>
                  <span className={cx('ellipse')}></span>
                  <p>{conditionPeriod}</p>
                </div>
              </div>
              <div className={cx('modal-content__row')}>
                <p className={cx('modal-content__condition')}>{t('bid')}</p>
                <p className={cx('modal-content__title')}>{conditionBid}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default BankInfoModal
