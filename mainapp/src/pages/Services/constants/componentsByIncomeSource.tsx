import { Column } from '@src/components/ui/Column'

import { CompanyName } from '../components/CompanyName'
import { FieldOfActivity } from '../components/FieldOfActivity'
import { MonthlyIncome } from '../components/MonthlyIncome'
import { NoIncome } from '../components/NoIncome'
import { Profession } from '../components/Profession'
import { StartDate } from '../components/StartDate'

export const componentsByIncomeSource: ComponentsByIncomeSource = {
  option_1: [
    <MonthlyIncome key="MonthlyIncome1" />,
    <StartDate key="StartDate1" />,
    <FieldOfActivity key="FieldOfActivity1" />,
    <CompanyName key="CompanyName1" />,
    <Profession key="Profession1" />,
  ],
  option_2: [
    <MonthlyIncome key="MonthlyIncome2" />,
    <StartDate key="StartDate2" />,
    <FieldOfActivity key="FieldOfActivity2" />,
    <CompanyName key="CompanyName2" />,
    <Profession key="Profession2" />,
  ],
  option_3: [
    <MonthlyIncome key="MonthlyIncome3" />,
    <StartDate key="StartDate3" />,
    <FieldOfActivity key="FieldOfActivity3" />,
    <CompanyName key="CompanyName3" />,
    <Profession key="Profession3" />,
  ],
  option_4: [
    <MonthlyIncome key="MonthlyIncome4" />,
    <StartDate key="StartDate4" />,
    <FieldOfActivity key="FieldOfActivity4" />,
    <CompanyName key="CompanyName4" />,
    <Profession key="Profession4" />,
  ],
  option_5: [<NoIncome key="NoIncome5" />, <Column key="column" />],
  option_6: [<MonthlyIncome key="MonthlyIncome6" />, <Column key="column" />],
  option_7: [<MonthlyIncome key="MonthlyIncome7" />, <Column key="column" />],
}

interface ComponentsByIncomeSource {
  [key: string]: React.ReactNode[]
}
