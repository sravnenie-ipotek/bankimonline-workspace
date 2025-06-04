import classNames from 'classnames/bind'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Accordion } from '@src/components/ui/Accordion'
import AccordionItemWripper from '@src/components/ui/Accordion/AccordionItems/AccordionItemWrapper'
import FinancialItem from '@src/components/ui/Accordion/AccordionItems/FinancialItem/FinantialItem'
import { Button } from '@src/components/ui/Button'
import { FeaturesAfterDeal } from '@src/components/ui/FeaturesAfterDeal'
import { MortgageCard } from '@src/components/ui/MortgageCard'
import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from '@src/components/ui/MortgageCard/types'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import { RootState } from '@src/store'

import { Notification } from '../Notifications'
import styles from './servicePlate.module.scss'

const cx = classNames.bind(styles)

interface ServicePlateProps {
  dataMortgageCalculation?: dataMortgageCalculation
  dataMortgageRefinancing?: dataMortgageRefinancing
  dataLoanCalculation?: dataLoanCalculation
  dataLoanRefinancing?: dataLoanRefinancing
  afterDealVisible: {
    viewCalculateMortgage: boolean
    viewRefinanceLoan: boolean
    viewRefinanceMortgage: boolean
    viewCalculateLoan: boolean
  }
}

const ServicePlate: React.FC<ServicePlateProps> = ({
  dataMortgageCalculation,
  dataMortgageRefinancing,
  dataLoanCalculation,
  dataLoanRefinancing,
  afterDealVisible,
}) => {
  const [buttonData, setButtonData] = useState({ text: '', link: '' })

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  const { nav } = useRoute()

  const status =
    dataMortgageCalculation?.status ??
    dataMortgageRefinancing?.status ??
    dataLoanCalculation?.status ??
    dataLoanRefinancing?.status //передача статуса анкеты
  useMemo(() => {
    switch (status) {
      case 'completeSurvey':
        setButtonData({
          text: t('home.buttonText.completeSurvey'),
          link: nav('completeSurvey'),
        })
        break
      case 'documentsNotAccepted':
        setButtonData({
          text: t('home.buttonText.documentsNotAccepted'),
          link: nav('documentsNotAccepted'),
        })
        break
      case 'questionnaireNotAccepted':
        setButtonData({
          text: t('home.buttonText.questionnaireNotAccepted'),
          link: nav('questionnaireNotAccepted'),
        })
        break
      case 'sendApplicationBank':
        setButtonData({
          text: t('home.buttonText.sendApplicationBank'),
          link: nav('sendApplicationBank'),
        })
        break
      case 'viewOffers':
        setButtonData({
          text: t('home.buttonText.viewOffers'),
          link: nav('viewOffers'),
        })
        break
      default:
        setButtonData({
          text: t('home.buttonText.incorrectStatus'),
          link: nav('home'),
        })
        break
    }
  }, [status, isRussian])

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
      {status !== 'theDealCompleted' ? (
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
          <div className="flex w-full justify-end">
            {status !== 'waitResponseBank' && (
              <div className={cx(styles.buttonWidth)}>
                {buttonData.text.length > 27 ? (
                  <Button view="flex" to={buttonData.link} className="h-[56px]">
                    <p className={cx(styles.buttonText)}>{buttonData.text}</p>
                  </Button>
                ) : (
                  <Button to={buttonData.link} className="h-[56px]">
                    <p className={cx(styles.buttonText)}>{buttonData.text}</p>
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      ) : afterDealVisible.viewCalculateMortgage === false &&
        afterDealVisible.viewRefinanceLoan === false &&
        afterDealVisible.viewRefinanceMortgage === false &&
        afterDealVisible.viewCalculateLoan === false ? null : (
        <FeaturesAfterDeal
          viewCalculateMortgage={afterDealVisible.viewCalculateMortgage}
          viewRefinanceLoan={afterDealVisible.viewRefinanceLoan}
          viewRefinanceMortgage={afterDealVisible.viewRefinanceMortgage}
          viewCalculateLoan={afterDealVisible.viewCalculateLoan}
        />
      )}
    </div>
  )
}

export default ServicePlate
