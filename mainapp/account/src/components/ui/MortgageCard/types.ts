export interface dataMortgageCalculation {
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
  documentProgress: number // процентное запонение шкалы прогресса
  mortgageAmount: number //сумма ипотеки
  term: number //срок
  initialPayment: number // первоначальный взнос
  percent: number // процент
  borrowedFundsWithPercentages: number // Сумма заемных средств вместе с процентами за весь период
  monthlyPayment: number // Ежемесячный платеж
  profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты
  documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов
  coBorrowers?: {
    //созаёмщики
    [key: string]: {
      //созаёмщик
      profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты созаёмщика
      documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов созаёмщика
    }
  }
  message?: {
    textRu: string // текст сообщения Ru
    textHe: string // текст сообщения He
    link: string // ссыка при нажатии
    status:
      | 'replyTechnSupport'
      | 'documentsAccepted'
      | 'documentsNotAccepted'
      | 'banksOffers' // статусы сообщения
  }
}

export interface dataMortgageRefinancing {
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
  documentProgress: number // процентное запонение шкалы прогресса
  mortgageBalance: number //остаток по ипотеке
  borrowedFundsWithPercentages: number // Сумма заемных средств вместе с процентами за весь период
  monthlyPayment: number // Ежемесячный платеж
  term: number //срок
  profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты
  documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов
  coBorrowers?: {
    //созаёмщики
    [key: string]: {
      //созаёмщик
      profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты созаёмщика
      documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов созаёмщика
    }
  }
  message?: {
    textRu: string // текст сообщения Ru
    textHe: string // текст сообщения He
    link: string // ссыка при нажатии
    status:
      | 'replyTechnSupport'
      | 'documentsAccepted'
      | 'documentsNotAccepted'
      | 'banksOffers' // статусы сообщения
  }
}

export interface dataLoanCalculation {
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
  documentProgress: number // процентное запонение шкалы прогресса
  loanAmount: number //сумма кредита
  term: number //срок
  borrowedFundsWithPercentages: number // Сумма заемных средств вместе с процентами за весь период
  monthlyPayment: number // ежемесячный платёж
  profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты
  documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов
  coBorrowers?: {
    //созаёмщики
    [key: string]: {
      //созаёмщик
      profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты созаёмщика
      documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов созаёмщика
    }
  }
  message?: {
    textRu: string // текст сообщения Ru
    textHe: string // текст сообщения He
    link: string // ссыка при нажатии
    status:
      | 'replyTechnSupport'
      | 'documentsAccepted'
      | 'documentsNotAccepted'
      | 'banksOffers' // статусы сообщения
  }
}

export interface dataLoanRefinancing {
  status:
    | 'completeSurvey'
    | 'documentsNotAccepted'
    | 'questionnaireNotAccepted'
    | 'sendApplicationBank'
    | 'waitResponseBank'
    | 'viewOffers'
    | 'theDealCompleted' //статус заявки
  documentProgress: number // процентное запонение шкалы прогресса
  sumOfAllLoans: number //сумма всех предитов
  totalMonthlyPayment: number //срок
  borrowedFundsWithPercentages: number // Сумма заемных средств вместе с процентами за весь период
  monthlyPayment: number // ежемесячный платёж
  profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты
  documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов
  coBorrowers?: {
    //созаёмщики
    [key: string]: {
      //созаёмщик
      profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты созаёмщика
      documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов созаёмщика
    }
  }
  message?: {
    textRu: string // текст сообщения Ru
    textHe: string // текст сообщения He
    link: string // ссыка при нажатии
    status:
      | 'replyTechnSupport'
      | 'documentsAccepted'
      | 'documentsNotAccepted'
      | 'banksOffers' // статусы сообщения
  }
}
