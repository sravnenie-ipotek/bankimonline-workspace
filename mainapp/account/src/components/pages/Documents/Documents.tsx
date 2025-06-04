import React from 'react'

import { serviceDocuments } from './types'
import { TopLayout } from './ui/TopLayout'

const mortgageCalculation: serviceDocuments = {
  status: 'completeSurvey',
  userName: 'Александр Пушкин',
  user: [
    {
      documentType: 'Кредитная история',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: 'sd65cv6we',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Паспорт лицевая сторона',
      isUpload: true,
      documentName: 'dssdv',
      documentPath:
        'https://db.green-bookva.shop/authors/h1ndf68a9evc9fb8oyfz.webp',
      documentSize: '666 KB',
      documentStatus: 'checked',
    },
    {
      documentType: 'Паспорт оборотная сторона',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '8ew4c9we98c4',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType: 'Вкладыш в паспорт',
      isUpload: true,
      documentName: 'pdf-blank.pdf',
      documentPath:
        'https://felicita.kharkov.ua/wp-content/uploads/2017/10/pdf-blank.pdf',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Справка о доходах за последние 3 месяца (Сотрудник)',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath:
        'https://db.green-bookva.shop/authors/udfepdzb0gwrs5vy162o.webp',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Последний доход не подтвержденный CPA',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType: 'Доход, подтвержденный CPA',
      isUpload: true,
      documentName: 'cbdcwpencoiwecoiweociewc.pdf',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'checked',
    },
    {
      documentType: 'Налоговая оценка прошлого года',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType: 'Налоговая оценка позапрошлого года',
      isUpload: false,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType:
        'Выписка о движении средств по банковскому счету за последние 3 месяца (Для всех счетов)',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType: 'Справки о балансе средств на всех депозитных счетах',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'checked',
    },
    {
      documentType:
        'Подтверждение владения банковским счетом (Для всех счетов)',
      isUpload: false,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Справки о балансе средств на всех кредитных счетах',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath:
        'https://db.green-bookva.shop/product/4dm4iexfonb4nkdf2s75.webp',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType: 'Страховка жизни и здоровья',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Страховка недвижимости',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Документы на недвижимость',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'checked',
    },
    {
      documentType: 'Заключение об оценке стоимости недвижимости (опционально)',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '0000',
      documentSize: '666 KB',
      documentStatus: 'notAccepted',
    },
    {
      documentType:
        'Договор купли-продажи квартиры или план разрешения на строительство при самостоятельном строительстве (Если есть',
      isUpload: false,
      documentName: 'Пачпорт',
      documentPath: '',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
  ],
  coBorrowers: {
    'Аркадий Стругацкий': [
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '1666 KB',
        documentStatus: 'accepted',
      },
    ],
    'Борис Стругацкий': [
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Название_файла66666.pdf',
        documentPath: '0000',
        documentSize: '1666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType:
          'Подтверждение владения банковским счетом (Для всех счетов)',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: false,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType:
          'Договор купли-продажи квартиры или план разрешения на строительство при самостоятельном строительстве (Если есть)',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
      {
        documentType: 'Название',
        isUpload: true,
        documentName: 'Пачпорт',
        documentPath: '0000',
        documentSize: '666 KB',
        documentStatus: 'accepted',
      },
    ],
  },
}

const mortgageRefinancing: serviceDocuments = {
  status: 'NonCompleteSurvey',
  userName: 'Александр Пушкин 2',
  user: [
    {
      documentType: 'Название',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '0000',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Название',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '0000',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Название',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '0000',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
    {
      documentType: 'Название',
      isUpload: true,
      documentName: 'Пачпорт',
      documentPath: '0000',
      documentSize: '666 KB',
      documentStatus: 'accepted',
    },
  ],
  coBorrowers: {},
}

const Documents: React.FC = () => {
  return (
    <TopLayout
      mortgageCalculation={mortgageCalculation}
      mortgageRefinancing={mortgageRefinancing}
      loanCalculation={mortgageCalculation}
      loanRefinancing={mortgageCalculation}
    />
  )
}

export default Documents
