import { Bank } from '../components/Bank'
import { EndDate } from '../components/EndDate'
import { MonthlyPayment } from '../components/MonthlyPayment'

export const componentsByObligation: ComponentByObligation = {
  option_2: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  option_3: [
    <Bank key="Bank" />,
    <MonthlyPayment key="MonthlyPayment" />,
    <EndDate key="EndDate" />,
  ],
  option_4: [<MonthlyPayment key="MonthlyPayment" />],
  option_5: [<MonthlyPayment key="MonthlyPayment" />],
}

interface ComponentByObligation {
  [key: string]: React.ReactNode[]
}
