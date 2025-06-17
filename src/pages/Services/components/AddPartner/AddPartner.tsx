import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { AddButton } from '@components/ui/AddButton'
import { Error } from '@components/ui/Error'
import { TitleElement } from '@components/ui/TitleElement'
import { UserProfileCard } from '@components/ui/UserProfileCard'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { updateMortgageData } from '@src/pages/Services/slices/calculateMortgageSlice.ts'

import { deleteBorrowersPersonalData } from '../../slices/borrowersPersonalDataSlice'
import { FormTypes } from '../../types/formTypes'

const AddPartner = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { values, touched, errors } = useFormikContext<FormTypes>()
  const borrowerValue = useAppSelector(
    (state) => state.borrowersPersonalData.borrowersPersonalData
  )

  return (
    <>
      <TitleElement title={t('calculate_mortgage_add_partner_title')} />

      {borrowerValue.obligation ? (
        <UserProfileCard
          name={borrowerValue.nameSurname}
          enableEdit
          onEdit={() => navigate('/services/borrowers-personal-data/1')}
          onDelete={() => dispatch(deleteBorrowersPersonalData())}
        />
      ) : (
        <AddButton
          value={t('calculate_mortgage_add_partner')}
          onClick={() => {
            dispatch(updateMortgageData(values))
            navigate('/services/borrowers-personal-data/1')
          }}
          style={{ height: '3rem', padding: '0' }}
        />
      )}

      {!borrowerValue.obligation && touched.addPartner && errors.addPartner && (
        <Error error={errors.addPartner} />
      )}
    </>
  )
}

export default AddPartner
