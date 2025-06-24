import { useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { Column } from '@components/ui/Column'
import Calendar from '@components/ui/Calendar/Calendar'

import { FormTypes } from '../../types/formTypes'

const DocumentIssueDate = () => {
  const { t } = useTranslation()
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <Calendar
        title={t('document_issue_date_title')}
        placeholder={t('document_issue_date_placeholder')}
        value={values.documentIssueDate || ''}
        onChange={(value) => setFieldValue('documentIssueDate', value)}
        onBlur={() => setFieldTouched('documentIssueDate', true)}
        error={touched.documentIssueDate && errors.documentIssueDate}
      />
    </Column>
  )
}

export { DocumentIssueDate }
