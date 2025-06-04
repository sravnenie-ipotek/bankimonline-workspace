import classNames from 'classnames/bind'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FeaturesAfterDeal } from '@src/components/ui/FeaturesAfterDeal'
import { FeaturesBeforeDeal } from '@src/components/ui/FeaturesBeforeDeal'
import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from '@src/components/ui/MortgageCard/types'

import { PageTitle } from '../../../../ui/Titles/PageTitle'
import { ServiceLine } from '../ServiceLine'
import { ServicePlate } from '../ServicePlate'
import styles from './topLayout.module.scss'

const cx = classNames.bind(styles)

interface TopLayoutProps {
  dataMortgageCalculation?: dataMortgageCalculation
  dataMortgageRefinancing?: dataMortgageRefinancing
  dataLoanCalculation?: dataLoanCalculation
  dataLoanRefinancing?: dataLoanRefinancing
}

const TopLayout: React.FC<TopLayoutProps> = ({
  dataMortgageCalculation,
  dataMortgageRefinancing,
  dataLoanCalculation,
  dataLoanRefinancing,
}: TopLayoutProps) => {
  const { t } = useTranslation()

  const [dealType, setDealType] = useState('none')

  //установка состояния страницы
  useEffect(() => {
    if (dataMortgageCalculation) setDealType('mortgageCalculation')
    if (dataMortgageRefinancing) setDealType('mortgageRefinancing')
    if (dataLoanCalculation) setDealType('loanCalculation')
    if (dataLoanRefinancing) setDealType('loanRefinancing')
  }, [
    dataMortgageCalculation,
    dataMortgageRefinancing,
    dataLoanCalculation,
    dataLoanRefinancing,
  ])

  const afterDealVisible = {
    viewCalculateMortgage: dataMortgageCalculation ? false : true,
    viewRefinanceLoan: dataMortgageRefinancing ? false : true,
    viewRefinanceMortgage: dataLoanCalculation ? false : true,
    viewCalculateLoan: dataLoanRefinancing ? false : true,
  }

  return (
    <div className={cx(styles.mainPlate)}>
      <PageTitle title={t('services.title')} />
      {/*содержимое страницы*/}
      {dealType !== 'none' && (
        <ServiceLine title={t('services.titleQuestionnaire')} />
      )}
      {dealType !== 'none' ? (
        <div className={cx(styles.servicesPlate)}>
          {dataMortgageCalculation && (
            <ServicePlate dataMortgageCalculation={dataMortgageCalculation} />
          )}
          {dataMortgageRefinancing && (
            <ServicePlate dataMortgageRefinancing={dataMortgageRefinancing} />
          )}
          {dataLoanCalculation && (
            <ServicePlate dataLoanCalculation={dataLoanCalculation} />
          )}
          {dataLoanRefinancing && (
            <ServicePlate dataLoanRefinancing={dataLoanRefinancing} />
          )}
          {afterDealVisible.viewCalculateMortgage === false &&
          afterDealVisible.viewRefinanceLoan === false &&
          afterDealVisible.viewRefinanceMortgage === false &&
          afterDealVisible.viewCalculateLoan === false ? null : (
            <div className="mt-[-55px]">
              <FeaturesAfterDeal
                viewCalculateMortgage={afterDealVisible.viewCalculateMortgage}
                viewRefinanceLoan={afterDealVisible.viewRefinanceLoan}
                viewRefinanceMortgage={afterDealVisible.viewRefinanceMortgage}
                viewCalculateLoan={afterDealVisible.viewCalculateLoan}
              />
            </div>
          )}
        </div>
      ) : (
        <FeaturesBeforeDeal />
      )}
    </div>
  )
}

export default TopLayout
