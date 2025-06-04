import React from 'react'

import {
  dataLoanCalculation,
  dataLoanRefinancing,
  dataMortgageCalculation,
  dataMortgageRefinancing,
} from '@src/components/ui/MortgageCard/types'

import { TopLayout } from './ui/TopLayout'

//рассчёт ипотеки

const dataMortgageCalculationData: dataMortgageCalculation = {
  status: 'completeSurvey',
  documentProgress: 44,
  mortgageAmount: 1000000,
  term: 360,
  initialPayment: 500000,
  borrowedFundsWithPercentages: 700000,
  monthlyPayment: 10000,
  percent: 50,
  profileStatus: 'required',
  documentsStatus: 'nonAccepted',
  coBorrowers: {
    coBorrower1: {
      profileStatus: 'nonAccepted',
      documentsStatus: 'accepted',
    },
  },
  message: {
    status: 'replyTechnSupport',
    textRu: 'На ваш запрос #564828 пришёл ответ от технической поддержки',
    textHe: "בקשתך מס' 564828 קיבלה תשובה מתמיכה טכנית",
    link: '/',
  },
}

//рефинансирование ипотеки

const dataMortgageRefinancingData: dataMortgageRefinancing = {
  status: 'theDealCompleted',
  documentProgress: 100,
  mortgageBalance: 2000000,
  term: 360,
  borrowedFundsWithPercentages: 3000000,
  monthlyPayment: 30000,
  profileStatus: 'nonAccepted',
  documentsStatus: 'accepted',
  coBorrowers: {
    coBorrower1: {
      profileStatus: 'nonAccepted',
      documentsStatus: 'accepted',
    },
    coBorrower2: {
      profileStatus: 'required',
      documentsStatus: 'nonAccepted',
    },
  },
  message: {
    status: 'documentsAccepted',
    textRu: 'Отправленные вами джокументы успешно прошли проверку',
    textHe: 'מסמכי ה-Joku ששלחת אומתו בהצלחה',
    link: '/',
  },
}

//рассчёт кредита

const dataLoanCalculationData: dataLoanCalculation = {
  status: 'viewOffers',
  documentProgress: 20,
  loanAmount: 3000000,
  term: 360,
  borrowedFundsWithPercentages: 4500000,
  monthlyPayment: 500000,
  profileStatus: 'required',
  documentsStatus: 'accepted',
  coBorrowers: {
    coBorrower1: {
      profileStatus: 'nonAccepted',
      documentsStatus: 'accepted',
    },
    coBorrower2: {
      profileStatus: 'required',
      documentsStatus: 'nonAccepted',
    },
    coBorrower3: {
      profileStatus: 'nonAccepted',
      documentsStatus: 'required',
    },
    coBorrower4: {
      profileStatus: 'required',
      documentsStatus: 'nonAccepted',
    },
  },
  message: {
    status: 'documentsNotAccepted',
    textRu:
      'Александр Пушкин: Паспорт лицевая сторона не принят и еще 3 документа не принято',
    textHe:
      'אלכסנדר פושקין: הצד הקדמי של הדרכון לא התקבל ולא התקבלו 3 מסמכים נוספים',
    link: '/',
  },
}

//рефинансирование кредита

const dataLoanRefinancingData: dataLoanRefinancing = {
  status: 'waitResponseBank',
  documentProgress: 70,
  sumOfAllLoans: 4000000,
  totalMonthlyPayment: 2000,
  borrowedFundsWithPercentages: 700000,
  monthlyPayment: 10000,
  profileStatus: 'required',
  documentsStatus: 'required',
  coBorrowers: {},
  message: {
    status: 'banksOffers',
    textRu:
      'Банк Leumi, Hapoalim выслали свои предложения. Ознакомьтесь с ними',
    textHe: 'בנק לאומי והפועלים שלחו את הצעותיהם. בדוק אותם',
    link: '/',
  },
}

const Home: React.FC = () => {
  return (
    <TopLayout
      dataMortgageCalculation={dataMortgageCalculationData}
      dataMortgageRefinancing={dataMortgageRefinancingData}
      dataLoanCalculation={dataLoanCalculationData}
      dataLoanRefinancing={dataLoanRefinancingData}
    />
  )
}

export default Home
