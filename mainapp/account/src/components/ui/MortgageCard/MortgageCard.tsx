import classNames from 'classnames/bind'
import React from 'react'

import { MortgageCardDetails } from '@src/components/ui/MortgageCard/MortgageCardDetails'

import MortgageCardSteps from './MortgageCardSteps/MortgageCardSteps.tsx'
import styles from './mortgageCard.module.scss'
import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from './types.ts'

const cx = classNames.bind(styles)

interface MortgageCardProps {
  dataMortgageCalculation?: dataMortgageCalculation
  dataMortgageRefinancing?: dataMortgageRefinancing
  dataLoanCalculation?: dataLoanCalculation
  dataLoanRefinancing?: dataLoanRefinancing
}

const MortgageCard: React.FC<MortgageCardProps> = ({
  dataMortgageCalculation,
  dataMortgageRefinancing,
  dataLoanCalculation,
  dataLoanRefinancing,
}) => {
  const getService = () => {
    if (dataMortgageCalculation) return 'mortgageCalculation'
    if (dataMortgageRefinancing) return 'mortgageRefinancing'
    if (dataLoanCalculation) return 'loanCalculation'
    if (dataLoanRefinancing) return 'loanRefinancing'
  }

  //сбор всех данных

  //MortgageCardDetails

  const service = getService() //опеределение типа услуги на основе переданных данных

  const mainPrice =
    dataMortgageCalculation?.mortgageAmount ??
    dataMortgageRefinancing?.mortgageBalance ??
    dataLoanCalculation?.loanAmount ??
    dataLoanRefinancing?.sumOfAllLoans //в зависимости от услуги передаётся одна из стоимостей
  const term =
    dataMortgageCalculation?.term ??
    dataMortgageRefinancing?.term ??
    dataLoanCalculation?.term //в зависимости от услуги передаётся один из сроков
  const addPrice =
    dataMortgageCalculation?.initialPayment ??
    dataLoanCalculation?.monthlyPayment ??
    dataLoanRefinancing?.totalMonthlyPayment //в зависимости от услуги передаётся вторая стоимость
  const status =
    dataMortgageCalculation?.status ??
    dataMortgageRefinancing?.status ??
    dataLoanCalculation?.status ??
    dataLoanRefinancing?.status //передача статуса анкеты

  //MortgageCardSteps

  const progress =
    dataMortgageCalculation?.documentProgress ??
    dataMortgageRefinancing?.documentProgress ??
    dataLoanCalculation?.documentProgress ??
    dataLoanRefinancing?.documentProgress //передача статуса анкеты

  const profileStatus =
    dataMortgageCalculation?.profileStatus ??
    dataMortgageRefinancing?.profileStatus ??
    dataLoanCalculation?.profileStatus ??
    dataLoanRefinancing?.profileStatus // статус анкеты

  const documentsStatus =
    dataMortgageCalculation?.documentsStatus ??
    dataMortgageRefinancing?.documentsStatus ??
    dataLoanCalculation?.documentsStatus ??
    dataLoanRefinancing?.documentsStatus // статус документов

  const coBorrowers =
    dataMortgageCalculation?.coBorrowers ??
    dataMortgageRefinancing?.coBorrowers ??
    dataLoanCalculation?.coBorrowers ??
    dataLoanRefinancing?.coBorrowers // созаёмщики

  if (
    !mainPrice ||
    !service ||
    !status ||
    !progress ||
    !profileStatus ||
    !documentsStatus
  )
    return //если нет обязательных данных, то return

  return (
    <div className={cx(styles.mortgageCardWrapper)}>
      <MortgageCardDetails
        service={service}
        mainPrice={mainPrice}
        term={term}
        addPrice={addPrice}
        percent={dataMortgageCalculation?.percent}
        status={status}
      />
      <div className={cx(styles.mortgageCardLine)} />
      <MortgageCardSteps
        progress={progress}
        profileStatus={profileStatus}
        documentsStatus={documentsStatus}
        coBorrowers={coBorrowers}
      />
    </div>
  )
}

export default MortgageCard
