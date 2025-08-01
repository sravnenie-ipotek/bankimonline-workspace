import { Bank } from '../components/Bank'
import { EndDate } from '../components/EndDate'
import { MonthlyPayment } from '../components/MonthlyPayment'

export const componentsByObligation: ComponentByObligation = {
  obligations_bank_loan: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  obligations_consumer_credit: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  obligations_credit_card: [<MonthlyPayment key="MonthlyPayment" />],
  obligations_other: [<MonthlyPayment key="MonthlyPayment" />],
}

interface ComponentByObligation {
  [key: string]: React.ReactNode[]
}
