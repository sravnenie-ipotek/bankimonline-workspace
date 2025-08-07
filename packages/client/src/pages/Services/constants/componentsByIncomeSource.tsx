import { Column } from '@src/components/ui/Column'

import { CompanyName } from '../components/CompanyName'
import { FieldOfActivity } from '../components/FieldOfActivity'
import { MonthlyIncome } from '../components/MonthlyIncome'
import { NoIncome } from '../components/NoIncome'
import { Profession } from '../components/Profession'
import { StartDate } from '../components/StartDate'

export const componentsByIncomeSource: ComponentsByIncomeSource = {
  employee: [
    <MonthlyIncome key="MonthlyIncome1" />,
    <StartDate key="StartDate1" />,
    <FieldOfActivity key="FieldOfActivity1" />,
    <CompanyName key="CompanyName1" />,
    <Profession key="Profession1" />,
  ],
  selfemployed: [
    <MonthlyIncome key="MonthlyIncome2" />,
    <StartDate key="StartDate2" />,
    <FieldOfActivity key="FieldOfActivity2" />,
    <CompanyName key="CompanyName2" />,
    <Profession key="Profession2" />,
  ],
  pension: [
    <MonthlyIncome key="MonthlyIncome4" />,
    <Column key="column" />,
  ],
  unemployed: [<NoIncome key="NoIncome5" />, <Column key="column" />],
  unpaid_leave: [<NoIncome key="NoIncome6" />, <Column key="column" />],
  student: [<MonthlyIncome key="MonthlyIncome7" />, <Column key="column" />],
  other: [<MonthlyIncome key="MonthlyIncome8" />, <Column key="column" />],
}

interface ComponentsByIncomeSource {
  [key: string]: React.ReactNode[]
}
