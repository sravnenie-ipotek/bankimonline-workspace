import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Plus } from '@assets/icons/Plus'
import { Document, serviceDocuments } from '@pages/Documents/types'
import { Button } from '@src/components/ui/Button'
import Select from '@src/components/ui/Select/Select'
import { Tab } from '@src/components/ui/Tab'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import { DocumentsPlate } from '../DocumentsPlate'
import { DocumentsTitle } from '../DocumentsTitle'
import styles from './topLayout.module.scss'

const cx = classNames.bind(styles)

interface TopLayoutProps {
  mortgageCalculation?: serviceDocuments
  mortgageRefinancing?: serviceDocuments
  loanCalculation?: serviceDocuments
  loanRefinancing?: serviceDocuments
}

const TopLayout: React.FC<TopLayoutProps> = ({
  mortgageCalculation,
  mortgageRefinancing,
  loanCalculation,
  loanRefinancing,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMobile } = useWindowResize()

  const theme = useTheme()

  const { t } = useTranslation()

  const primaryIconColor = theme?.colors?.textTheme.primary

  //определение услуг
  const [selectService, setSelectService] = useState('')
  const [nowService, setNowService] = useState<serviceDocuments | null>(null)
  const [cardsData, setCardsData] = useState<{ [key: string]: Document[] }[]>(
    []
  )
  const [oneUserData, setOneUserData] = useState<Document[]>([])
  //выбор дефолтной услуги (в обратном порядке)
  const [selectServiceOptions, setSelectServiceOptions] = useState<
    { name: string; value: string }[]
  >([])
  useEffect(() => {
    const points: { name: string; value: string }[] = []
    if (loanRefinancing) {
      points.push({
        name: t('mortageCard.mortgageCardDetails.loanRefinancing.serviceName'),
        value: 'loanRefinancing',
      })
    }
    if (loanCalculation) {
      points.push({
        name: t('mortageCard.mortgageCardDetails.loanCalculation.serviceName'),
        value: 'loanCalculation',
      })
    }
    if (mortgageRefinancing) {
      points.push({
        name: t(
          'mortageCard.mortgageCardDetails.mortgageRefinancing.serviceName'
        ),
        value: 'mortgageRefinancing',
      })
    }
    if (mortgageCalculation) {
      points.push({
        name: t(
          'mortageCard.mortgageCardDetails.mortgageCalculation.serviceName'
        ),
        value: 'mortgageCalculation',
      })
    }
    setSelectServiceOptions(points.reverse())
  }, [])

  useEffect(() => {
    switch (selectService) {
      case 'mortgageCalculation':
        setNowService(mortgageCalculation ?? null)
        break
      case 'mortgageRefinancing':
        setNowService(mortgageRefinancing ?? null)
        break
      case 'loanCalculation':
        setNowService(loanCalculation ?? null)
        break
      case 'loanRefinancing':
        setNowService(loanRefinancing ?? null)
        break
      default:
        setNowService(null)
        break
    }
  }, [selectService])

  //запись данных для отображения документов
  useEffect(() => {
    if (nowService) {
      const coBorrowersArray: { [key: string]: Document[] }[] = []
      if (nowService.coBorrowers) {
        for (const coBorrower in nowService.coBorrowers) {
          const documents = nowService.coBorrowers[coBorrower]
          coBorrowersArray.push({ [coBorrower]: documents })
        }
      }

      const resultArray: { [key: string]: Document[] }[] = [
        { [nowService.userName]: nowService.user },
        ...coBorrowersArray,
      ]

      setCardsData(resultArray)
    }
  }, [nowService])

  useEffect(() => {
    if (nowService) {
      const resultArray = [nowService.user]
      setOneUserData(resultArray[0])
    }
  }, [cardsData])

  const TabData = {
    titles: cardsData.map((person, index) => (
      <p key={index}>{Object.keys(person)[0]}</p>
    )),
    content: cardsData.map((people) => {
      if (people) {
        return Object.values(people).map((person, index) => {
          if (person) {
            return (
              <DocumentsPlate
                status={nowService ? nowService.status : ''}
                key={index}
                documents={person}
              />
            )
          }
          return null
        })
      }
      return []
    }),
  }

  return (
    <div className="w-full">
      <DocumentsTitle />
      {isMobile && (
        <Button variant="secondary" view="flex" className="h-[40px] mb-[24px]">
          <div
            className={cx({
              'mr-[0.6rem]': isRussian,
              'ml-[0.6rem]': !isRussian,
            })}
          >
            <Plus color={primaryIconColor} size={24} />
          </div>
          {t('questionnaire.addCoBorrower')}
        </Button>
      )}
      <p className={cx(styles.serviceTitle)}>{t('documents.service')}</p>
      <div className={cx(styles.selectPadding)}>
        <Select
          selectPoints={selectServiceOptions}
          value={selectService}
          onChange={setSelectService}
        />
      </div>
      {cardsData.length > 1 ? (
        <Tab data={TabData} />
      ) : (
        oneUserData && (
          <DocumentsPlate
            status={nowService ? nowService.status : ''}
            documents={oneUserData}
          />
        )
      )}
    </div>
  )
}

export default TopLayout
