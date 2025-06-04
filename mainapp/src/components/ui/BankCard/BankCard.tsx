import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { Divider } from '../Divider'
import { Info } from '../Info'
import styles from './bankCard.module.scss'

const cx = classNames.bind(styles)
type TypeProps = {
  title: string
  infoTitle: string
  children: React.ReactNode
  mortgageAmount: number
  totalAmount: number
  mothlyPayment: number
}
const BankCard: React.FC<TypeProps> = ({
  title,
  infoTitle,
  children,
  mortgageAmount,
  totalAmount,
  mothlyPayment,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const formattedMortgageAmount = mortgageAmount.toLocaleString('en-US')
  const formattedTotalAmount = totalAmount.toLocaleString('en-US')
  const formattedMonthlyPayment = mothlyPayment.toLocaleString('en-US')

  return (
    <div className={cx('card')}>
      <div className={cx('card-title')}>
        <h3 className={cx('card-title__text')}>{title}</h3>
        <Info title={infoTitle} />
      </div>
      <div className={cx('card-children')}>{children}</div>
      <Divider />
      <div className={cx('card-footer')}>
        <div className={cx('card-check')}>
          <p className={cx('card-check__title')}>{t('mortgage_total')}</p>
          <p className={cx('card-check__price')}>{formattedMortgageAmount} ₪</p>
        </div>
        <div className={cx('card-check')}>
          <p className={cx('card-check__title')}>
            {t('mortgage_total_return')}
          </p>
          <p className={cx('card-check__price')}>{formattedTotalAmount} ₪</p>
        </div>
        <div className={cx('card-check')}>
          <p className={cx('card-check__title')}>{t('mortgage_monthly')}</p>
          <p className={cx('card-check__price')}>{formattedMonthlyPayment} ₪</p>
        </div>
      </div>
      <button type="button" className={cx('card-button')}>
        {t('mortgage_select_bank')}
      </button>
    </div>
  )
}

export default BankCard
