import React from 'react'
import { useTranslation } from 'react-i18next'

import { PaymentsDataType } from '@pages/Payments/types/PaymentsData'
import { Tab } from '@src/components/ui/Tab'
import { PageTitle } from '@src/components/ui/Titles/PageTitle'

import { Cards } from '../Cards'
import { Transactions } from '../Transactions'

export interface TopLayoutProps {
  data: PaymentsDataType
}

const TopLayout: React.FC<TopLayoutProps> = ({ data }) => {
  const { t } = useTranslation()
  const TabData = {
    titles: [t('payments.card.title'), t('payments.transactions.title')],
    content: [
      <Cards data={data.cards} key={0} />,
      <Transactions data={data.transactions} key={1} />,
    ],
  }
  return (
    <div className="w-full">
      <PageTitle title={t('payments.title')} />
      <Tab view="100%" data={TabData} />
    </div>
  )
}

export default TopLayout
