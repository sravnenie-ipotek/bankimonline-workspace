export interface PaymentsDataType {
  cards: Record<
    string,
    {
      cardNumber: string
      cardName: string
      cardType: string
      cardPaymentSystem: 'Visa' | 'MasterCard' | 'American Express' | 'Diners'
      checked: boolean
    }
  >
  transactions: Record<
    string,
    {
      id: string
      service: string
      sum: number
      date: string
      status: boolean
      check?: string
    }
  >
}
