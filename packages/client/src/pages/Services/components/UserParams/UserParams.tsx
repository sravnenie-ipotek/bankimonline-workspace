import React from 'react'

import { Column } from '@src/components/ui/Column'
import { Row } from '@src/components/ui/Row'

import { MortgageParameters } from '../MortgageParameters'
import { PersonalProfile } from '../PersonalProfile'

interface UserParamsProps {
  cost?: number
  initialPayment?: number
  period?: number
  credit?: number
  nameSurname?: string
  phoneNumber?: string
}

const UserParams: React.FC<UserParamsProps> = ({
  cost,
  initialPayment,
  period,
  credit,
  nameSurname,
  phoneNumber,
}) => {
  return (
    <Row style={{ columnGap: '3rem', justifyContent: 'flex-start' }}>
      <MortgageParameters
        cost={cost}
        initialPayment={initialPayment}
        period={period}
        credit={credit}
      />
      <PersonalProfile name={nameSurname} phone={phoneNumber} />
      <Column />
    </Row>
  )
}

export default UserParams
