import { Column } from '@src/components/ui/Column'

import { CompanyName } from '../components/CompanyName'
import { FieldOfActivity } from '../components/FieldOfActivity'
import { MonthlyIncome } from '../components/MonthlyIncome'
import { NoIncome } from '../components/NoIncome'
import { Profession } from '../components/Profession'
import { StartDate } from '../components/StartDate'

// ✅ FIXED: Make componentsByIncomeSource a function that accepts screenLocation
// This ensures FieldOfActivity gets the correct screenLocation prop for API calls
export const getComponentsByIncomeSource = (screenLocation: string): ComponentsByIncomeSource => ({
  employee: [
    <MonthlyIncome key="MonthlyIncome1" screenLocation={screenLocation} />,
    <StartDate key="StartDate1" screenLocation={screenLocation} />,
    <FieldOfActivity key="FieldOfActivity1" screenLocation={screenLocation} />,
    <CompanyName key="CompanyName1" screenLocation={screenLocation} />,
    <Profession key="Profession1" screenLocation={screenLocation} />,
  ],
  selfemployed: [
    <MonthlyIncome key="MonthlyIncome2" screenLocation={screenLocation} />,
    <StartDate key="StartDate2" screenLocation={screenLocation} />,
    <FieldOfActivity key="FieldOfActivity2" screenLocation={screenLocation} />,
    <CompanyName key="CompanyName2" screenLocation={screenLocation} />,
    <Profession key="Profession2" screenLocation={screenLocation} />,
  ],
  pension: [
    <MonthlyIncome key="MonthlyIncome4" screenLocation={screenLocation} />,
    <Column key="column" />,
  ],
  unemployed: [<NoIncome key="NoIncome5" screenLocation={screenLocation} />, <Column key="column" />],
  unpaid_leave: [<NoIncome key="NoIncome6" screenLocation={screenLocation} />, <Column key="column" />],
  student: [<MonthlyIncome key="MonthlyIncome7" screenLocation={screenLocation} />, <Column key="column" />],
  other: [<MonthlyIncome key="MonthlyIncome8" screenLocation={screenLocation} />, <Column key="column" />],
})

// Keep backward compatibility - default to auto-detection
export const componentsByIncomeSource: ComponentsByIncomeSource = getComponentsByIncomeSource('auto-detect')

interface ComponentsByIncomeSource {
  [key: string]: React.ReactNode[]
}
