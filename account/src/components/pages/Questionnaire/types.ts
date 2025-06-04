export interface QuestionnaireDataPeople {
  questionnaireStatus: 'ended' | 'send'
  name: string
  phone: string
  incomeType: string
  incomeSum: number
}

export interface QuestionnaireData {
  user: QuestionnaireDataPeople
  coBorrowers?: QuestionnaireDataPeople[]
}
