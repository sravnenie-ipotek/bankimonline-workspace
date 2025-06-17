import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'

import { useAppSelector } from '@src/hooks/store'

import { CodeForm } from './CodeForm'

export type CodeFormType = {
  code: string
}

type TypeProps = {
  title: string
  subtitle: string
  onSubmit: ({ code }: { code: string }) => void
  buttonText: string
  onBack: () => void
}

const Code: React.FC<TypeProps> = ({
  title,
  subtitle,
  onSubmit,
  buttonText,
  onBack,
}) => {
  const code = useAppSelector((state) => state.login.registrationData.code)

  const initialValues: CodeFormType = {
    code: code || '',
  }

  const validationSchema = Yup.object().shape({
    code: Yup.string().min(4).max(4).required(),
  })

  return (
    <Formik
      validationSchema={validationSchema}
      validateOnMount
      initialValues={initialValues}
      onSubmit={(values) => console.log(values)}
    >
      <Form>
        <CodeForm
          title={title}
          subtitle={subtitle}
          onSubmit={onSubmit}
          buttonText={buttonText}
          onBack={onBack}
        />
      </Form>
    </Formik>
  )
}

export default Code
