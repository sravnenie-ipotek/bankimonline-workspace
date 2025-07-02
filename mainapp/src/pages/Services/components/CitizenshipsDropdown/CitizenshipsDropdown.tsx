import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import { MultiSelect } from '@components/ui/MultiSelect'
import { TitleElement } from '@components/ui/TitleElement'

import { FormTypes } from '../../types/formTypes.ts'

const CitizenshipsDropdown = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  // Static list of countries for citizenship selection
  // Using string array as required by MultiSelect component
  const citizenshipOptions = [
    'ישראל', // Israel
    'ארצות הברית', // United States
    'רוסיה', // Russia
    'גרמניה', // Germany
    'צרפת', // France
    'בריטניה', // United Kingdom
    'קנדה', // Canada
    'אוסטרליה', // Australia
    'איטליה', // Italy
    'ספרד', // Spain
    'הולנד', // Netherlands
    'בלגיה', // Belgium
    'שוויץ', // Switzerland
    'אוסטריה', // Austria
    'שוודיה', // Sweden
    'נורווגיה', // Norway
    'דנמרק', // Denmark
    'פינלנד', // Finland
    'פולין', // Poland
    'צ\'כיה', // Czech Republic
    'הונגריה', // Hungary
    'רומניה', // Romania
    'בולגריה', // Bulgaria
    'יוון', // Greece
    'קפריסין', // Cyprus
    'פורטוגל', // Portugal
    'אירלנד', // Ireland
    'לוקסמבורג', // Luxembourg
    'מלטה', // Malta
    'סלובקיה', // Slovakia
    'סלובניה', // Slovenia
    'קרואטיה', // Croatia
    'ליטא', // Lithuania
    'לטביה', // Latvia
    'אסטוניה', // Estonia
    'אוקראינה', // Ukraine
    'בלרוס', // Belarus
    'מולדובה', // Moldova
    'ארגנטינה', // Argentina
    'ברזיל', // Brazil
    'צ\'ילה', // Chile
    'מקסיקו', // Mexico
    'יפן', // Japan
    'דרום קוריאה', // South Korea
    'סין', // China
    'הודו', // India
    'תאילנד', // Thailand
    'סינגפור', // Singapore
    'מלזיה', // Malaysia
    'פיליפינים', // Philippines
    'אינדונזיה', // Indonesia
    'וייטנאם', // Vietnam
    'דרום אפריקה', // South Africa
    'מרוקו', // Morocco
    'מצרים', // Egypt
    'טורקיה', // Turkey
    'אחר' // Other
  ]

  return (
    <Column>
      <TitleElement title={t('calculate_mortgage_citizenship_title')} />
      <MultiSelect
        data={citizenshipOptions}
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
