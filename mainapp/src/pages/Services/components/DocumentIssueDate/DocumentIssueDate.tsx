import { useFormikContext } from 'formik'
import { useContentApi } from '@src/hooks/useContentApi'

import { Column } from '@components/ui/Column'
import Calendar from '@components/ui/Calendar/Calendar'

import { FormTypes } from '../../types/formTypes'

const DocumentIssueDate = () => {
  const { getContent } = useContentApi('personal_data_form')
  const { values, setFieldValue, errors, touched, setFieldTouched } =
    useFormikContext<FormTypes>()

  return (
    <Column>
      <Calendar
        title={getContent('personal_data_document_issue_date', 'Document Issue Date')}
        placeholder={getContent('personal_data_document_issue_date_ph', 'Select document issue date')}
        value={values.documentIssueDate || ''}
        onChange={(value) => setFieldValue('documentIssueDate', value)}
        onBlur={() => setFieldTouched('documentIssueDate', true)}
        error={touched.documentIssueDate && errors.documentIssueDate}
      />
    </Column>
  )
}

export { DocumentIssueDate }
