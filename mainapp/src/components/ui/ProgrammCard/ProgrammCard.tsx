import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import useDisclosure from '@src/hooks/useDisclosure'
import getYearWord from '@src/utils/helpers/getYearWord.ts'

import { CalendarBlankIcon } from '../../../assets/icons/CalendarBlankIcon'
import { InfoIcon } from '../../../assets/icons/InfoIcon'
import { PercentIcon } from '../../../assets/icons/PercentIcon'
import { BankInfoModal } from './BankInfoModal'
import styles from './programmCard.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  title: string
  mortgageAmount: number
  monthlyPayment: number
  percent: number
  period: number
  description: string
  conditionFinance: string
  conditionPeriod: string
  conditionBid: string
}
const ProgrammCard: React.FC<TypeProps> = ({
  title,
  mortgageAmount,
  monthlyPayment,
  percent,
  period,
  description,
  conditionFinance,
  conditionPeriod,
  conditionBid,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  const formattedMortgageAmount = mortgageAmount.toLocaleString('en-US')
  const formattedMonthlyPayment = monthlyPayment.toLocaleString('en-US')

  const [opened, { open, close }] = useDisclosure()

  return (
    <>
      <div className={cx('card')}>
        <div className={cx('card-title')}>
          <span className={cx('card-title__ellipse')}></span>
          <p className={cx('card-title__text')}>{title}</p>
          <InfoIcon
            className={cx('card-title__info')}
            onClick={open}
            size={20}
          />
        </div>
        <div className={cx('wrapper')}>
          <div className={cx('card-content')}>
            <p className={cx('card-content__desc')}>{t('mortgage_total')}</p>
            <p className={cx('card-content__price')}>
              {formattedMortgageAmount} ₪
            </p>
          </div>
          <div className={cx('card-content')}>
            <p className={cx('card-content__desc')}>{t('mortgage_monthly')}</p>
            <p className={cx('card-content__price')}>
              {formattedMonthlyPayment} ₪
            </p>
          </div>
        </div>
        <div className={cx('wrapper')}>
          <div className={cx('card-desc')}>
            <PercentIcon />
            <div className={cx('card-desc__content')}>
              <p className={cx('card-desc__content-desc')}>
                {t('mortgage_percnt')}
              </p>
              <p className={cx('card-desc__content-title')}>{Number(percent).toFixed(2)}%</p>
            </div>
          </div>
          <div className={cx('card-desc')}>
            <CalendarBlankIcon />
            <div className={cx('card-desc__content')}>
              <p className={cx('card-desc__content-desc')}>
                {t('mortgage_term')}
              </p>
              <p className={cx('card-desc__content-title')}>
                {period} {getYearWord(period)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BankInfoModal
        isVisible={opened}
        onClose={close}
        title={title}
        description={description}
        conditionFinance={conditionFinance}
        conditionPeriod={conditionPeriod}
        conditionBid={conditionBid}
      />
    </>
  )
}

export default ProgrammCard
