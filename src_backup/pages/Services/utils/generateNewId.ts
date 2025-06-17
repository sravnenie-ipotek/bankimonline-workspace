import { MortgageDataTypes } from '@src/pages/Services/pages/RefinanceMortgage/pages/FirstStep/FirstStepForm/ui/MortgageData/MortgageData.tsx'

import { CreditDataTypes } from '../pages/RefinanceCredit/pages/FirstStep/FirstStepForm/ui/CreditData/CreditData'
import {
  AdditionalIncomeModalTypes,
  ObligationModalTypes,
  SourceOfIncomeModalTypes,
} from '../types/formTypes'

type TypeProps =
  | SourceOfIncomeModalTypes
  | AdditionalIncomeModalTypes
  | ObligationModalTypes
  | MortgageDataTypes
  | CreditDataTypes

export const generateNewId = (array: TypeProps[]) => {
  const maxId = Math.max(0, ...array.map((item) => item.id))
  return maxId + 1
}
