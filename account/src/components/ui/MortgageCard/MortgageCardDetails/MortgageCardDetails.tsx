import classNames from 'classnames/bind'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { MortgageCardDetailsInfo } from '@src/components/ui/MortgageCard/MortgageCardDetails/MortgageCardDetailsInfo'
import { MortgageCardDetailsTitle } from '@src/components/ui/MortgageCard/MortgageCardDetails/MortgageCardDetailsTitle'
import useTheme from '@src/hooks/useTheme.ts'

import i18n from '../../../../../utils/i18n'
import { ServiceStatusLabel } from '../../Labels/ServiceStatusLabel'
import styles from './mortgageCardDetails.module.scss'

const cx = classNames.bind(styles)

interface MortgageCardDetailsProps {
  service: string //тип услуги
  mainPrice: number // первая цифра стоимости
  term?: number // срок
  addPrice?: number // вторая цифра стоимости
  percent?: number // вторая цифра стоимости
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
}

const MortgageCardDetails: React.FC<MortgageCardDetailsProps> = ({
  service,
  mainPrice,
  term,
  addPrice,
  percent,
  status,
}) => {
  const theme = useTheme()
  const { t } = useTranslation()

  const primaryIconColor = theme?.colors?.accent.primary

  const isRussian = i18n.language === 'ru'

  const [titles, setTitles] = useState({
    serviceName: '',
    mainPriceName: '',
    addPrice: '',
  })

  useEffect(() => {
    switch (service) {
      case 'mortgageRefinancing':
        setTitles({
          ...titles,
          serviceName: t(
            'mortageCard.mortgageCardDetails.mortgageRefinancing.serviceName'
          ),
          mainPriceName: t(
            'mortageCard.mortgageCardDetails.mortgageRefinancing.mainPriceName'
          ),
        })
        break
      case 'loanCalculation':
        setTitles({
          serviceName: t(
            'mortageCard.mortgageCardDetails.loanCalculation.serviceName'
          ),
          mainPriceName: t(
            'mortageCard.mortgageCardDetails.loanCalculation.mainPriceName'
          ),
          addPrice: t(
            'mortageCard.mortgageCardDetails.loanCalculation.addPrice'
          ),
        })
        break
      case 'loanRefinancing':
        setTitles({
          serviceName: t(
            'mortageCard.mortgageCardDetails.loanRefinancing.serviceName'
          ),
          mainPriceName: t(
            'mortageCard.mortgageCardDetails.loanRefinancing.mainPriceName'
          ),
          addPrice: t(
            'mortageCard.mortgageCardDetails.loanRefinancing.addPrice'
          ),
        })
        break
      default:
        setTitles({
          serviceName: t(
            'mortageCard.mortgageCardDetails.mortgageCalculation.serviceName'
          ),
          mainPriceName: t(
            'mortageCard.mortgageCardDetails.mortgageCalculation.mainPriceName'
          ),
          addPrice: t(
            'mortageCard.mortgageCardDetails.mortgageCalculation.addPrice'
          ),
        })
        break
    }
  }, [service, isRussian])

  return (
    <div className={cx(styles.mortgageCardDetailsWrapper)}>
      <MortgageCardDetailsTitle
        title={titles.serviceName}
        primaryIconColor={primaryIconColor}
      />

      <ServiceStatusLabel status={status} />

      <div className={cx(styles.mortgageCardDetailsInfo)}>
        <MortgageCardDetailsInfo
          amount={`${mainPrice.toLocaleString('en-US')} ₪`}
          text={titles.mainPriceName}
        />

        {service !== 'loanRefinancing' && (
          <MortgageCardDetailsInfo
            mortgageTem={
              isRussian
                ? `${term} ${t('mortageCard.mortgageCardDetails.mortgageTerm')}`
                : `${t('mortageCard.mortgageCardDetails.mortgageTerm')} ${term}`
            }
            text={t('mortageCard.mortgageCardDetails.mortgageTermName')}
          />
        )}

        {service !== 'mortgageRefinancing' && (
          <MortgageCardDetailsInfo
            amount={
              addPrice ? `${addPrice.toLocaleString('en-US')} ₪` : undefined
            }
            text={titles.addPrice}
            percent={
              percent ? (isRussian ? `${percent}%` : `%${percent}`) : undefined
            }
          />
        )}
      </div>
    </div>
  )
}

export default MortgageCardDetails
