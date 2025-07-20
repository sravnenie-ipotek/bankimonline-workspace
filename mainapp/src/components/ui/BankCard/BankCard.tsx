import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useContentApi } from '@src/hooks/useContentApi'

import { useAppDispatch } from '@src/hooks/store'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'

import { Divider } from '../Divider'
import { Info } from '../Info'
import styles from './bankCard.module.scss'

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
  title: string
  infoTitle: string
  children: React.ReactNode
  mortgageAmount: number
  totalAmount: number
  mothlyPayment: number
  // Bank selection data
  bankOffer?: BankOfferType
  onBankSelect?: (bank: BankOfferType) => void
}

const BankCard: React.FC<TypeProps> = ({
  title,
  infoTitle,
  children,
  mortgageAmount,
  totalAmount,
  mothlyPayment,
  bankOffer,
  onBankSelect,
}: TypeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const dispatch = useAppDispatch()

  const formattedMortgageAmount = mortgageAmount.toLocaleString('en-US')
  const formattedTotalAmount = totalAmount.toLocaleString('en-US')
  const formattedMonthlyPayment = mothlyPayment.toLocaleString('en-US')

  const handleBankSelection = () => {
    // Create bank offer data if not provided
    const selectedBankOffer: BankOfferType = bankOffer || {
      id: `bank_${Date.now()}`,
      bankName: title,
      program: infoTitle,
      rate: 0, // Will be extracted from children or set default
      monthlyPayment: mothlyPayment,
      totalAmount: totalAmount,
      mortgageAmount: mortgageAmount
    }

    // Save selected bank to Redux state
    dispatch(updateMortgageData({
      selectedBank: selectedBankOffer,
      selectedBankId: selectedBankOffer.id,
      selectedBankName: selectedBankOffer.bankName
    }))

    // Call external handler if provided
    if (onBankSelect) {
      onBankSelect(selectedBankOffer)
    }

    // Show registration modal according to documentation flow
    dispatch(setActiveModal('signUp'))
    dispatch(openAuthModal())
    
    console.log(`[BANK SELECTION] Selected bank: ${selectedBankOffer.bankName}`)
    console.log(`[BANK SELECTION] Bank data:`, selectedBankOffer)
  }

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
          <p className={cx('card-check__title')}>{getContent('mortgage_total', 'mortgage_total')}</p>
          <p className={cx('card-check__price')}>{formattedMortgageAmount} ₪</p>
        </div>
        <div className={cx('card-check')}>
          <p className={cx('card-check__title')}>
            {getContent('mortgage_total_return', 'mortgage_total_return')}
          </p>
          <p className={cx('card-check__price')}>{formattedTotalAmount} ₪</p>
        </div>
        <div className={cx('card-check')}>
          <p className={cx('card-check__title')}>{getContent('mortgage_monthly', 'mortgage_monthly')}</p>
          <p className={cx('card-check__price')}>{formattedMonthlyPayment} ₪</p>
        </div>
      </div>
      <button 
        type="button" 
        className={cx('card-button')}
        onClick={handleBankSelection}
      >
        {getContent('mortgage_select_bank', 'mortgage_select_bank')}
      </button>
    </div>
  )
}

export default BankCard
