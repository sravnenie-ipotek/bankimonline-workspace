import classNames from 'classnames/bind'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Headphones } from '@assets/icons/Headphones'
import { Button } from '@src/components/ui/Button'
import { FeaturesBeforeDeal } from '@src/components/ui/FeaturesBeforeDeal'
import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from '@src/components/ui/MortgageCard/types'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import { HomeTitle } from '../HomeTitle'
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
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMediumTablet, isDesktop } = useWindowResize()

  const { t } = useTranslation()

  const { nav } = useRoute()

  const [dealType, setDealType] = useState('none')

  //для заголовка с анкетами
  const [dealsCount, setDealsCount] = useState(0)

  //установка состояния страницы
  useEffect(() => {
    let count = 0
    if (dataMortgageCalculation) {
      setDealType('mortgageCalculation')
      count++
    }
    if (dataMortgageRefinancing) {
      setDealType('mortgageRefinancing')
      count++
    }
    if (dataLoanCalculation) {
      setDealType('loanCalculation')
      count++
    }
    if (dataLoanRefinancing) {
      setDealType('loanRefinancing')
      count++
    }
    setDealsCount(count)
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
      <HomeTitle dealType={dealType} />
      {/*содержимое страницы*/}
      {dealType !== 'none' && (
        <ServiceLine
          title={
            dealsCount > 1
              ? t('home.titleQuestionnaireMore')
              : t('home.titleQuestionnaireOne')
          }
        />
      )}
      {dealType !== 'none' ? (
        <div className={cx(styles.servicesPlate)}>
          {dataMortgageCalculation && (
            <ServicePlate
              dataMortgageCalculation={dataMortgageCalculation}
              afterDealVisible={afterDealVisible}
            />
          )}
          {dataMortgageRefinancing && (
            <ServicePlate
              dataMortgageRefinancing={dataMortgageRefinancing}
              afterDealVisible={afterDealVisible}
            />
          )}
          {dataLoanCalculation && (
            <ServicePlate
              dataLoanCalculation={dataLoanCalculation}
              afterDealVisible={afterDealVisible}
            />
          )}
          {dataLoanRefinancing && (
            <ServicePlate
              dataLoanRefinancing={dataLoanRefinancing}
              afterDealVisible={afterDealVisible}
            />
          )}
        </div>
      ) : (
        <FeaturesBeforeDeal />
      )}
      {!isMediumTablet && !isDesktop && (
        <Button
          variant="secondary"
          view="flex"
          className="h-[56px]"
          to={nav('support')}
        >
          <div className="flex w-full justify-center items-center">
            <Headphones size={24} />
            <p
              className={cx(styles.textButtonSize, {
                'ml-[0.6rem]': isRussian,
                'mr-[0.6rem]': !isRussian,
              })}
            >
              {t('home.supportMobile')}
            </p>
          </div>
        </Button>
      )}
    </div>
  )
}

export default TopLayout
