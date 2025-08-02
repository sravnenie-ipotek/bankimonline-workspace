import { Bank } from '../components/Bank'
import { EndDate } from '../components/EndDate'
import { MonthlyPayment } from '../components/MonthlyPayment'

export const componentsByObligation: ComponentByObligation = {
  bank_loan: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  consumer_credit: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  credit_card: [<MonthlyPayment key="MonthlyPayment" />],
  other: [<MonthlyPayment key="MonthlyPayment" />],
}

interface ComponentByObligation {
  [key: string]: React.ReactNode[]
}
