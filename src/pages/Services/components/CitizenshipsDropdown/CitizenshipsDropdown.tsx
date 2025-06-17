import { useFormikContext } from 'formik'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { MultiSelect } from '@components/ui/MultiSelect'
import { TitleElement } from '@components/ui/TitleElement'

import { useGetCitiesQuery } from '../../api/api.ts'
import { FormTypes } from '../../types/formTypes.ts'

const CitizenshipsDropdown = () => {
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { data: data, isLoading, isError } = useGetCitiesQuery()

  const [selectedCitizenship, setSelectedCitizenship] = useState([''])

  useEffect(() => {
    if (!isLoading && !isError && data) {
      setSelectedCitizenship(Object.values(data.data))
    }
  }, [data, isLoading, isError])
  console.log(selectedCitizenship)

  return (
    <Column>
      <TitleElement title={t('calculate_mortgage_citizenship_title')} />
      <MultiSelect
        data={selectedCitizenship}
        placeholder={t('calculate_mortgage_citizenship_ph')}
        searchable
        searchPlaceholder={t('search')}
        nothingFoundText={t('nothing_found')}
        searchDescription={t('countries')}
        value={values.citizenshipsDropdown}
        onChange={(value) => setFieldValue('citizenshipsDropdown', value)}
        onBlur={() => setFieldTouched('citizenshipsDropdown', true)}
        error={touched.citizenshipsDropdown && errors.citizenshipsDropdown}
      />
    </Column>
  )
}

export default CitizenshipsDropdown
