import React from 'react'
import { BankInfoModal } from '@components/ui/ProgrammCard/BankInfoModal'

interface ProgramConditionsModalProps {
  isOpen: boolean
  onClose: () => void
  programData?: {
    title: string
    description: string
    conditionFinance: string
    conditionPeriod: string
    conditionBid: string
  }
}

const ProgramConditionsModal: React.FC<ProgramConditionsModalProps> = ({
  isOpen,
  onClose,
  programData
}) => {
  // Default program data if none provided
  const defaultProgramData = {
    title: 'Программа ипотечного кредитования',
    description: 'Подробное описание программы ипотечного кредитования с выгодными условиями для клиентов.',
    conditionFinance: '₪ 500,000 - ₪ 2,000,000',
    conditionPeriod: '5-30 лет',
    conditionBid: '2.5% - 4.5%'
  }

  const data = programData || defaultProgramData

  return (
    <BankInfoModal
      isVisible={isOpen}
      onClose={onClose}
      title={data.title}
      description={data.description}
      conditionFinance={data.conditionFinance}
      conditionPeriod={data.conditionPeriod}
      conditionBid={data.conditionBid}
    />
  )
}

export { ProgramConditionsModal } 