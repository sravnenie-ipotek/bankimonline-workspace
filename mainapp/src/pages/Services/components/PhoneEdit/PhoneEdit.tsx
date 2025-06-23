import { useTranslation } from 'react-i18next'

import InfoButton from '@components/ui/InfoButton.tsx'
import { UserProfileCard } from '@components/ui/UserProfileCard'
import { RowTwo } from '@src/components/ui/RowTwo'

const PhoneEdit = () => {
  const { i18n } = useTranslation()

  return (
    <RowTwo>
      <InfoButton />
      <UserProfileCard name="Александр пушкин" phone="+ 935 234 3344" />
    </RowTwo>
  )
}

export default PhoneEdit
