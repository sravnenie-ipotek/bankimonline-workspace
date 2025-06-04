import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Accordion } from '@src/components/ui/Accordion'
import AccordionItemWripper from '@src/components/ui/Accordion/AccordionItems/AccordionItemWrapper'
import FinancialItem from '@src/components/ui/Accordion/AccordionItems/FinancialItem/FinantialItem'
import { MortgageCard } from '@src/components/ui/MortgageCard'
import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from '@src/components/ui/MortgageCard/types'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import { Notification } from '../Notifications'
import styles from './servicePlate.module.scss'

const cx = classNames.bind(styles)

interface ServicePlateProps {
  dataMortgageCalculation?: dataMortgageCalculation
  dataMortgageRefinancing?: dataMortgageRefinancing
  dataLoanCalculation?: dataLoanCalculation
  dataLoanRefinancing?: dataLoanRefinancing
}

const ServicePlate: React.FC<ServicePlateProps> = ({
  dataMortgageCalculation,
  dataMortgageRefinancing,
  dataLoanCalculation,
  dataLoanRefinancing,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'
  const { t } = useTranslation()

  const status =
    dataMortgageCalculation?.status ??
    dataMortgageRefinancing?.status ??
    dataLoanCalculation?.status ??
    dataLoanRefinancing?.status //передача статуса анкеты

  const message =
    dataMortgageCalculation?.message ??
    dataMortgageRefinancing?.message ??
    dataLoanCalculation?.message ??
    dataLoanRefinancing?.message //получение сообщения

  return (
    <div className={cx(styles.servicePlate)}>
      {message && (
        <Notification status={message.status} link={message.link}>
          {isRussian ? message.textRu : message.textHe}
        </Notification>
      )}
      <MortgageCard
        dataMortgageCalculation={dataMortgageCalculation}
        dataMortgageRefinancing={dataMortgageRefinancing}
        dataLoanCalculation={dataLoanCalculation}
        dataLoanRefinancing={dataLoanRefinancing}
      />
      {status !== 'theDealCompleted' && (
        <>
          <p className={cx(styles.accordionMargin)}>
            <Accordion value={t('accordion.title.preliminaryProgramSelection')}>
              <AccordionItemWripper>
                <FinancialItem
                  value={
                    (dataMortgageCalculation &&
                      dataMortgageCalculation.borrowedFundsWithPercentages) ||
                    (dataMortgageRefinancing &&
                      dataMortgageRefinancing.borrowedFundsWithPercentages) ||
                    (dataLoanCalculation &&
                      dataLoanCalculation.borrowedFundsWithPercentages) ||
                    (dataLoanRefinancing &&
                      dataLoanRefinancing.borrowedFundsWithPercentages)
                  }
                  label={t('accordion.items.paymentAtEndOfTerm')}
                />
                <FinancialItem
                  value={
                    (dataMortgageCalculation &&
                      dataMortgageCalculation.monthlyPayment) ||
                    (dataMortgageRefinancing &&
                      dataMortgageRefinancing.monthlyPayment) ||
                    (dataLoanCalculation &&
                      dataLoanCalculation.monthlyPayment) ||
                    (dataLoanRefinancing && dataLoanRefinancing.monthlyPayment)
                  }
                  label={t('accordion.items.monthlyPayment')}
                />
              </AccordionItemWripper>
            </Accordion>
          </p>
        </>
      )}
    </div>
  )
}

export default ServicePlate
