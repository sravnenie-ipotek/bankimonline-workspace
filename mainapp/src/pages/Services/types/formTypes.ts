export interface FormTypes {
  id: number
  nameSurname: string
  birthday: string
  education: string
  additionalCitizenships: string | null
  citizenshipsDropdown: string[]
  taxes: string | null
  countriesPayTaxes: string[]
  childrens: string | null
  howMuchChildrens: number
  medicalInsurance: string | null
  isForeigner: string | null
  publicPerson: string | null
  borrowers: number | null
  familyStatus: string
  partnerPayMortgage: string | null
  addPartner: string
  mainSourceOfIncome: string
  monthlyIncome: number | null
  startDate: string
  fieldOfActivity: string
  profession: string
  companyName: string
  additionalIncome: string
  additionalIncomeAmount: number | null
  obligation: string
  bank: string
  monthlyPaymentForAnotherBank: number | null
  endDate: string
  amountIncomeCurrentYear: number | null
  noIncome: string
  whoAreYouForBorrowers: string
  // New fields for LK-127 Partner Personal Data
  address?: string
  idDocument?: string
  documentIssueDate?: string
  gender?: string
  propertyOwnership?: string
}

export interface CalculateMortgageTypes {
  priceOfEstate: number
  cityWhereYouBuy: string
  whenDoYouNeedMoney: string
  initialFee: number
  typeSelect: string
  willBeYourFirst: string
  propertyOwnership: string  // Confluence Action #12: Property ownership affecting LTV (75%/50%/70%)
  period: number
  monthlyPayment: number
}

export interface CalculateCreditTypes {
  purposeOfLoan: string
  loanAmount: number
  whenDoYouNeedMoney: string
  loanDeferral: string
  priceOfEstate: number | null
  cityWhereYouBuy: string
  haveMortgage: string | null
  period: number
  monthlyPayment: number
}

export interface RefinanceCreditTypes {
  refinancingCredit: string
  period: number
  monthlyPayment: number
  desiredMonthlyPayment?: number | null
  desiredTerm?: number | null
  creditData: [
    {
      id: number
      bank: string
      amount: number | null
      monthlyPayment: number | null
      startDate: string
      endDate: string
      earlyRepayment: number | null
    },
  ]
}

export interface RefinanceMortgageTypes {
  whyRefinancingMortgage: string
  mortgageBalance: number
  priceOfEstate: number
  typeSelect: string
  bank: string
  startDate: string
  propertyRegistered: string
  period: number
  monthlyPayment: number
  decreaseMortgage: number | null
  increaseMortgage: number | null
  mortgageData: [
    {
      id: number
      program: string
      balance: number | null
      endDate: string
      bid: number | null
    },
  ]
}

export interface ModalTypes {
  sourceOfIncomeModal: SourceOfIncomeModalTypes[]
  additionalIncomeModal: AdditionalIncomeModalTypes[]
  obligationModal: ObligationModalTypes[]
}

export interface SourceOfIncomeModalTypes {
  id: number
  mainSourceOfIncome: string
  monthlyIncome: number | null
  startDate: string
  fieldOfActivity: string
  profession: string
  companyName: string
  amountIncomeCurrentYear: number | null
}

export interface AdditionalIncomeModalTypes {
  id: number
  additionalIncome: string
  additionalIncomeAmount: number | null
}

export interface ObligationModalTypes {
  id: number
  obligation: string
  bank: string
  monthlyPaymentForAnotherBank: number | null
  endDate: string
  noIncome: string | null
}
