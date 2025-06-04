import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddCreditCard from '@src/components/ui/AddCreditCard/AddCreditCard'
import { AlertPlate } from '@src/components/ui/AlertPlate'
import { Button } from '@src/components/ui/Button'
import { AddCreditCardBlock } from '@src/components/ui/CreditCards/AddCreditCardBlock'
import { EmptyCreditCard } from '@src/components/ui/CreditCards/EmptyCreditCard'
import { ViewCreditCard } from '@src/components/ui/CreditCards/ViewCreditCard'

import { CardPlate } from '../CardPlate'
import styles from './cards.module.scss'

const cx = classNames.bind(styles)

interface CardsProps {
  data: Record<
    string,
    {
      cardNumber: string
      cardName: string
      cardType: string
      cardPaymentSystem: 'Visa' | 'MasterCard' | 'American Express' | 'Diners'
      checked: boolean
    }
  >
}

const Cards: React.FC<CardsProps> = ({ data }) => {
  const { t } = useTranslation()

  const [visibleAddCreditCard, setVisibleAddCreditCard] = useState(false)

  const [visibleAlert, setVisibleAlert] = useState(false)

  const addCard = () => {
    setVisibleAddCreditCard(true)
    setVisibleAlert(true)
  }

  return (
    <div className="w-full flex flex-col">
      <AlertPlate
        text="Карта будет удалена"
        status={true}
        visible={visibleAlert}
        setVisible={setVisibleAlert}
      />
      <AddCreditCard
        visibleAddCreditCard={visibleAddCreditCard}
        setVisibleAddCreditCard={setVisibleAddCreditCard}
      />
      {Object.keys(data).length > 0 ? (
        <>
          <p className={cx(styles.cardsTitle)}>{t('payments.card.title')}</p>
          <div className={cx(styles.mainCardPlate)}>
            {Object.entries(data).map((card, index) => (
              <div key={index} className={cx(styles.viewCardPlate)}>
                <ViewCreditCard
                  cardNumber={card[1].cardNumber}
                  cardName={card[1].cardName}
                  cardType={card[1].cardType}
                  cardPaymentSystem={card[1].cardPaymentSystem}
                />
                <CardPlate
                  isSelect={card[1].checked}
                  name={card[1].cardNumber}
                />
              </div>
            ))}
            <AddCreditCardBlock onClick={addCard} />
          </div>
        </>
      ) : (
        <>
          <p className={cx(styles.cardsTitleNo)}>{t('payments.card.title')}</p>
          <div className={cx(styles.noDataPlate)}>
            <EmptyCreditCard />
            <p className={cx(styles.noDataTitle)}>
              {t('payments.card.nonCardTitle')}
            </p>
            <p className={cx(styles.noDataText)}>
              {t('payments.card.nonCardText')}
            </p>
            <div className="flex w-full justify-center">
              <div className={cx(styles.cardsButtonSize)}>
                <Button
                  view="flex"
                  onClick={addCard}
                  className="h-[40px] justify-center"
                >
                  {t('payments.card.nonCardButton')}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cards
