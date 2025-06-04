import React from 'react'

import { PaymentsDataType } from './types/PaymentsData'
import { TopLayout } from './ui/TopLayout'

const PaymentsData1: PaymentsDataType = {
  cards: {
    card1: {
      cardNumber: '**** **** **** 2345',
      cardName: 'Александр Пушкин',
      cardType: 'Card',
      cardPaymentSystem: 'Visa',
      checked: true,
    },
    card2: {
      cardNumber: '1234 5678 0123 4567',
      cardName: 'Михаил Булгаков',
      cardType: 'another',
      cardPaymentSystem: 'MasterCard',
      checked: false,
    },
    card3: {
      cardNumber: '0123 4567 7890 1166',
      cardName: 'Михаил Булгаков',
      cardType: 'card',
      cardPaymentSystem: 'American Express',
      checked: false,
    },
  },
  transactions: {
    transactions1: {
      id: '6511951951951',
      service: 'Рассчитать испотеку',
      sum: 1990,
      date: '2020-08-03T11:46:25+00:00',
      status: true,
      check: 'link',
    },
    transactions2: {
      id: '6511951951951',
      service: 'Рассчитать испотеку',
      sum: 1990,
      date: '2002-09-24T12:54:11+00:00',
      status: false,
    },
  },
}

/*const PaymentsData2: PaymentsDataType = {
  cards: {},
  transactions: {},
}*/

const Payments: React.FC = () => {
  return <TopLayout data={PaymentsData1} />
}

export default Payments
