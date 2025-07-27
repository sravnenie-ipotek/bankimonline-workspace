import classNames from 'classnames/bind'
import { useContentApi } from '@src/hooks/useContentApi'

import { Button } from '@components/ui/ButtonUI'
import { Divider } from '@components/ui/Divider'
import { Info } from '@components/ui/Info'

import styles from './bankOfferCard.module.scss'

const cx = classNames.bind(styles)

type BankOfferType = {
  id: string
  bankName: string
  program: string
  rate: number
  monthlyPayment: number
  totalAmount: number
  mortgageAmount: number
}

type TypeProps = {
  bank: BankOfferType
  onSelect: () => void
  isCredit?: boolean
}

const BankOfferCard: React.FC<TypeProps> = ({
  bank,
  onSelect,
  isCredit = false
}) => {
  const { getContent } = useContentApi('mortgage_step4')

  const formattedMortgageAmount = bank.mortgageAmount.toLocaleString('en-US')
  const formattedTotalAmount = bank.totalAmount.toLocaleString('en-US')
  const formattedMonthlyPayment = bank.monthlyPayment.toLocaleString('en-US')

  return (
    <div className={cx('bank-offer-card')}>
      <div className={cx('card-header')}>
        <h4 className={cx('bank-name')}>{bank.bankName}</h4>
        <p className={cx('program-name')}>{bank.program}</p>
      </div>

      <Divider />

      <div className={cx('card-content')}>
        <div className={cx('rate-section')}>
          <span className={cx('rate-label')}>
            {getContent('rate_label', 'Interest Rate')}
          </span>
          <span className={cx('rate-value')}>{bank.rate}%</span>
        </div>

        <div className={cx('payment-info')}>
          <Info
            title={getContent('monthly_payment', 'Monthly Payment')}
            value={`₪${formattedMonthlyPayment}`}
          />
          
          <Info
            title={isCredit ? 
              getContent('credit_amount', 'Credit Amount') : 
              getContent('mortgage_amount', 'Mortgage Amount')
            }
            value={`₪${formattedMortgageAmount}`}
          />
          
          <Info
            title={getContent('total_amount', 'Total Amount')}
            value={`₪${formattedTotalAmount}`}
          />
        </div>
      </div>

      <Divider />

      <div className={cx('card-footer')}>
        <Button
          onClick={onSelect}
          className={cx('select-button')}
          variant="primary"
          size="full"
        >
          {getContent('select_bank', 'Select This Bank')}
        </Button>
      </div>
    </div>
  )
}

export default BankOfferCard 