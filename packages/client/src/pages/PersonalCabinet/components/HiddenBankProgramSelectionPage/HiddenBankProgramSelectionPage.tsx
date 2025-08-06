import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import classNames from 'classnames/bind'

import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import { DropdownMenu } from '@components/ui/DropdownMenu'
import { useAppSelector } from '@src/hooks/store'

import styles from './hiddenBankProgramSelection.module.scss'

const cx = classNames.bind(styles)

interface HiddenBankProgram {
  id: string
  bankNumber: number
  programName: string
  interestRate: number
  monthlyPayment: number
  loanAmount: number
  termYears: number
  totalPayment: number
  originalTotalPayment: number
  originalMonthlyPayment: number
  isRecommended: boolean
}

interface HiddenBankData {
  id: string
  bankNumber: number
  programs: HiddenBankProgram[]
  totalLoanAmount: number
  totalPaymentAmount: number
  originalTotalPaymentAmount: number
  monthlyPayment: number
  originalMonthlyPayment: number
}

export const HiddenBankProgramSelectionPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [hiddenBanks, setHiddenBanks] = useState<HiddenBankData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>('maxTerm')
  const [selectedBanks, setSelectedBanks] = useState<string[]>([])

  // Get mortgage parameters from Redux store
  const mortgageParameters = useAppSelector((state) => state.mortgage)

  useEffect(() => {
    const loadHiddenBankData = async () => {
      try {
        setLoading(true)
        
        // Mock hidden bank data based on Figma design
        const mockHiddenBanks: HiddenBankData[] = [
          {
            id: 'bank-1',
            bankNumber: 1,
            totalLoanAmount: 1000000,
            totalPaymentAmount: 1100000,
            originalTotalPaymentAmount: 1500000,
            monthlyPayment: 9000,
            originalMonthlyPayment: 12000,
            programs: [
              {
                id: 'bank-1-prime',
                bankNumber: 1,
                programName: 'Прайм',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: true
              },
              {
                id: 'bank-1-fixed',
                bankNumber: 1,
                programName: 'Фиксированный процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              },
              {
                id: 'bank-1-variable',
                bankNumber: 1,
                programName: 'Плавающий процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              }
            ]
          },
          {
            id: 'bank-2',
            bankNumber: 1, // Note: Figma shows duplicate Bank #1
            totalLoanAmount: 1000000,
            totalPaymentAmount: 1100000,
            originalTotalPaymentAmount: 1500000,
            monthlyPayment: 9000,
            originalMonthlyPayment: 12000,
            programs: [
              {
                id: 'bank-2-prime',
                bankNumber: 1,
                programName: 'Прайм',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: true
              },
              {
                id: 'bank-2-fixed',
                bankNumber: 1,
                programName: 'Фиксированный процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              },
              {
                id: 'bank-2-variable',
                bankNumber: 1,
                programName: 'Плавающий процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              }
            ]
          },
          {
            id: 'bank-3',
            bankNumber: 3,
            totalLoanAmount: 1000000,
            totalPaymentAmount: 1100000,
            originalTotalPaymentAmount: 1500000,
            monthlyPayment: 9000,
            originalMonthlyPayment: 12000,
            programs: [
              {
                id: 'bank-3-prime',
                bankNumber: 3,
                programName: 'Прайм',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: true
              },
              {
                id: 'bank-3-fixed',
                bankNumber: 3,
                programName: 'Фиксированный процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              },
              {
                id: 'bank-3-variable',
                bankNumber: 3,
                programName: 'Плавающий процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              }
            ]
          },
          {
            id: 'bank-4',
            bankNumber: 4,
            totalLoanAmount: 1000000,
            totalPaymentAmount: 1100000,
            originalTotalPaymentAmount: 1500000,
            monthlyPayment: 9000,
            originalMonthlyPayment: 12000,
            programs: [
              {
                id: 'bank-4-prime',
                bankNumber: 4,
                programName: 'Прайм',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: true
              },
              {
                id: 'bank-4-fixed',
                bankNumber: 4,
                programName: 'Фиксированный процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              },
              {
                id: 'bank-4-variable',
                bankNumber: 4,
                programName: 'Плавающий процент, зависящий от инфляции',
                interestRate: 2.1,
                monthlyPayment: 3000,
                loanAmount: 500000,
                termYears: 20,
                totalPayment: 720000,
                originalTotalPayment: 800000,
                originalMonthlyPayment: 3500,
                isRecommended: false
              }
            ]
          }
        ]

        setHiddenBanks(mockHiddenBanks)
      } catch (error) {
        console.warn('⚠️ [HIDDEN-BANK-SELECTION] Failed to fetch hidden bank data')
      } finally {
        setLoading(false)
      }
    }

    loadHiddenBankData()
  }, [])

  // Sorting options based on Figma design
  const sortOptions = [
    { value: 'maxTerm', label: t('sort_by_max_term', 'Максимальный срок ипотеки') },
    { value: 'rate', label: t('sort_by_rate', 'По процентной ставке') },
    { value: 'payment', label: t('sort_by_payment', 'По ежемесячному платежу') }
  ]

  // Sort banks based on selected criteria
  const sortedBanks = [...hiddenBanks].sort((a, b) => {
    switch (sortBy) {
      case 'rate':
        const avgRateA = a.programs.reduce((sum, p) => sum + p.interestRate, 0) / a.programs.length
        const avgRateB = b.programs.reduce((sum, p) => sum + p.interestRate, 0) / b.programs.length
        return avgRateA - avgRateB
      case 'payment':
        return a.monthlyPayment - b.monthlyPayment
      case 'maxTerm':
        const maxTermA = Math.max(...a.programs.map(p => p.termYears))
        const maxTermB = Math.max(...b.programs.map(p => p.termYears))
        return maxTermB - maxTermA
      default:
        return 0
    }
  })

  // Action #2: Return to Personal Cabinet Button
  const handleBackNavigation = () => {
    navigate('/personal-cabinet')
  }

  // Action #14: Bank Selection
  const handleBankSelection = (bankId: string) => {
    setSelectedBanks(prev => {
      if (prev.includes(bankId)) {
        return prev.filter(id => id !== bankId)
      } else {
        return [...prev, bankId]
      }
    })
  }

  // Action #15: Continue Button - Navigate to next step
  const handleContinue = () => {
    if (selectedBanks.length === 0) {
      alert(t('select_bank_warning', 'Пожалуйста, выберите хотя бы один банк'))
      return
    }

    const selectedBanksData = hiddenBanks.filter(bank => 
      selectedBanks.includes(bank.id)
    )

    navigate('/personal-cabinet/bank-confirmation', {
      state: { selectedBanks: selectedBanksData }
    })
  }

  if (loading) {
    return (
      <div className={cx('container')}>
        <div className={cx('loading')}>
          {t('loading', 'Загрузка...')}
        </div>
      </div>
    )
  }

  return (
    <div className={cx('container')}>
      {/* Action #1: Logo Display - handled by PersonalCabinetLayout */}
      
      {/* Action #2: Return to Personal Cabinet Button */}
      <div className={cx('header')}>
        <button 
          className={cx('return-button')}
          onClick={handleBackNavigation}
          aria-label={t('return_to_cabinet', 'Вернуться в личный кабинет')}
        >
          <CaretRightIcon size={20} color="#ffffff" style={{ transform: 'rotate(180deg)' }} />
          {t('return_to_cabinet', 'Вернуться в личный кабинет')}
        </button>
      </div>

      {/* Action #3: Page Title Display */}
      <div className={cx('title-section')}>
        <h1 className={cx('page-title')}>
          {t('hidden_bank_selection_title', 'Выберите подходящие программы')}
        </h1>
      </div>

      {/* Action #3: Sorting Controls */}
      <div className={cx('controls-section')}>
        <div className={cx('sort-control')}>
          <label className={cx('sort-label')}>
            {t('sort_by', 'Сортировать по')}
          </label>
          <DropdownMenu
            data={sortOptions}
            placeholder={t('select_sort', 'Выберите сортировку')}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* Hidden Banks Grid - Actions #4-#13 */}
      <div className={cx('banks-grid')}>
        {sortedBanks.map((bank) => (
          <div key={bank.id} className={cx('bank-card')}>
            {/* Action #4: Bank Header with Hidden Name */}
            <div className={cx('bank-header')}>
              <h2 className={cx('bank-name')}>
                Банк #{bank.bankNumber}
              </h2>
              
              {/* Action #4: Payment Warning Disclaimer */}
              <div className={cx('payment-warning')}>
                <div className={cx('warning-icon')}>⚠</div>
                <span className={cx('warning-text')}>
                  {t('payment_warning', 'Чтобы увидеть название банка, оплатите услуги Bankimonline')}
                </span>
              </div>
            </div>

            {/* Action #5: Recommended Alert Bar */}
            <div className={cx('alert-bar', 'success')}>
              <div className={cx('alert-icon')}>✓</div>
              <span className={cx('alert-text')}>
                {t('best_conditions', 'Лучшие условия, Меньше процент')}
              </span>
            </div>

            {/* Action #6-#11: Program Cards */}
            <div className={cx('programs-section')}>
              {bank.programs.map((program) => (
                <div key={program.id} className={cx('program-card')}>
                  <div className={cx('program-header')}>
                    <div className={cx('program-indicator')}></div>
                    <span className={cx('program-name')}>{program.programName}</span>
                    <div className={cx('info-icon')}>ℹ</div>
                  </div>

                  <div className={cx('program-details')}>
                    {/* Action #7: Loan Amount Display */}
                    <div className={cx('detail-row')}>
                      <span className={cx('detail-label')}>
                        {t('loan_amount', 'Сумма ипотеки')}
                      </span>
                      <span className={cx('detail-value')}>
                        {program.loanAmount.toLocaleString('ru-RU')} ₪
                      </span>
                    </div>

                    {/* Action #8: Monthly Payment Display */}
                    <div className={cx('detail-row')}>
                      <span className={cx('detail-label')}>
                        {t('monthly_payment', 'Ежемесячный платеж')}
                      </span>
                      <span className={cx('detail-value')}>
                        {program.monthlyPayment.toLocaleString('ru-RU')} ₪
                      </span>
                    </div>

                    {/* Action #9: Interest Rate Display */}
                    <div className={cx('detail-row')}>
                      <div className={cx('rate-section')}>
                        <div className={cx('rate-icon')}>%</div>
                        <div className={cx('rate-info')}>
                          <span className={cx('rate-value')}>
                            {program.interestRate >= 2.1 ? 'от ' : ''}{program.interestRate}%
                          </span>
                          <span className={cx('rate-label')}>
                            {t('interest_rate', 'Процент')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action #10: Term Display */}
                    <div className={cx('detail-row')}>
                      <div className={cx('term-section')}>
                        <div className={cx('calendar-icon')}>📅</div>
                        <div className={cx('term-info')}>
                          <span className={cx('term-value')}>
                            {program.termYears} лет
                          </span>
                          <span className={cx('term-label')}>
                            {t('loan_term', 'Срок')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action #11: Bank Summary Information */}
            <div className={cx('bank-summary')}>
              <div className={cx('summary-divider')}></div>
              
              <div className={cx('summary-row')}>
                <span className={cx('summary-label')}>
                  {t('total_loan_amount', 'Cумма ипотеки')}
                </span>
                <span className={cx('summary-value')}>
                  {bank.totalLoanAmount.toLocaleString('ru-RU')} ₪
                </span>
              </div>

              {/* Action #12: Total Payment with Savings */}
              <div className={cx('summary-row')}>
                <span className={cx('summary-label')}>
                  {t('total_payment_term', 'Сумма выплат за весь срок')}
                </span>
                <div className={cx('payment-comparison')}>
                  <span className={cx('original-payment', 'crossed-out')}>
                    {bank.originalTotalPaymentAmount.toLocaleString('ru-RU')} ₪
                  </span>
                  <span className={cx('discounted-payment')}>
                    {bank.totalPaymentAmount.toLocaleString('ru-RU')} ₪
                  </span>
                </div>
              </div>

              {/* Action #13: Monthly Payment with Savings */}
              <div className={cx('summary-row')}>
                <span className={cx('summary-label')}>
                  {t('monthly_payment', 'Ежемесячный платеж')}
                </span>
                <div className={cx('payment-comparison')}>
                  <span className={cx('original-payment', 'crossed-out')}>
                    {bank.originalMonthlyPayment.toLocaleString('ru-RU')} ₪
                  </span>
                  <span className={cx('discounted-payment')}>
                    {bank.monthlyPayment.toLocaleString('ru-RU')} ₪
                  </span>
                </div>
              </div>
            </div>

            {/* Action #14: Bank Selection Button */}
            <button 
              className={cx('select-bank-button', {
                'selected': selectedBanks.includes(bank.id)
              })}
              onClick={() => handleBankSelection(bank.id)}
            >
              {selectedBanks.includes(bank.id) 
                ? t('bank_selected', 'Банк выбран') 
                : t('select_bank', 'Выбрать банк')
              }
            </button>
          </div>
        ))}
      </div>

      {/* Action #15: Continue Button */}
      {selectedBanks.length > 0 && (
        <div className={cx('actions-section')}>
          <button 
            className={cx('continue-button')}
            onClick={handleContinue}
          >
            {t('continue_to_next_step', 'Продолжить')}
          </button>
        </div>
      )}
    </div>
  )
} 