import React from 'react'

import { QuestionnaireData } from './types'
import { TopLayout } from './ui/TopLayout'

const questionnaireData1: QuestionnaireData = {
  user: {
    questionnaireStatus: 'send',
    name: 'Александр Пушкин',
    phone: '+ 935 234 3344',
    incomeType: 'Работа по найму',
    incomeSum: 3500,
  },
  coBorrowers: [
    {
      questionnaireStatus: 'send',
      name: 'Людмила Пушкина',
      phone: '+ 935 234 3344',
      incomeType: 'Работа на себя',
      incomeSum: 8500,
    },
    {
      questionnaireStatus: 'ended',
      name: 'Михаил Булгаков',
      phone: '+ 935 234 3344',
      incomeType: 'Творческая работа',
      incomeSum: 13500,
    },
  ],
}

/*const questionnaireData2: QuestionnaireData = {
  user: {
    questionnaireStatus: 'send',
    name: 'Михаил Лермонтов',
    phone: '+ 935 234 3344',
    incomeType: 'Работа на Кавказе',
    incomeSum: 5500,
  },
  coBorrowers: [],
}*/

const Questionnaire: React.FC = () => {
  return <TopLayout questionnaireData={questionnaireData1} />
}

export default Questionnaire
