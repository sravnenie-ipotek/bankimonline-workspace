import { useFormik, useFormikContext } from 'formik'
import { useTranslation } from 'react-i18next'

import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts'
import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts'
import { CodeInput } from '@components/ui/CodeInput'
import { Button } from '@components/ui/CustomButton'
import { Tab } from '@src/store/slices/authSlice.ts'

import styles from './CodeVerification.module.scss'

interface ICodeVerificationProps {
  tab: Tab
  title: string
  textButton: string
  handlePrevStep: () => void
  handleNextStep: (code: string, formik: any) => Promise<void>
}

export function CodeVerification<
  T extends { code: string | null; email: string | null; phone: string | null },
>({
  title,
  handlePrevStep,
  handleNextStep,
  tab,
  textButton,
}: ICodeVerificationProps) {
  const formikContext = useFormikContext<T>()

  const { t, i18n } = useTranslation()
  i18n.language = i18n.language?.split('-')[0]

  const formik = useFormik({
    initialValues: {
      code: formikContext.values.code,
    },
    onSubmit: async (values) => {
      await handleNextStep(values.code!, formik)
      console.log(values)
      // alert(JSON.stringify(values, null, 2))
      await formikContext.setValues({ ...formikContext.values, ...values })
    },
    validationSchema:
      i18n.language === 'he'
        ? validationSchemaHE.AuthFlow.CodeVerify
        : validationSchemaRU.AuthFlow.CodeVerify,
    validateOnMount: false,
  })

  return (
    <form className={styles.wrapper} onSubmit={formik.handleSubmit}>
      <h2 className={styles.title}>{title}</h2>
      {(() => {
        switch (tab) {
          case 'phone': {
            return (
              <>
                <p className={styles.descr}>
                  {t('sms_phone')} {formikContext.values.phone}
                </p>
                <div className={styles.verifyInputs}>
                  <CodeInput
                    error={formik.errors.code as string}
                    otpValue={formik.values.code || ''}
                    setOtpValue={(code) => formik.setFieldValue('code', code)}
                  />
                </div>
                <div className={styles.sendAgainWrapper}>
                  <span>{t('not_received_sms')}</span>
                  <button type="submit" className={styles.sendAgainButton}>
                    {t('send_sms_code_again')}
                  </button>
                </div>
              </>
            )
          }
          case 'email': {
            return (
              <>
                <p className={styles.descr}>
                  {t('sms_email')} {formikContext.values.email}
                </p>
                <div className={styles.verifyInputs}>
                  <CodeInput
                    error={formik.errors.code as string}
                    otpValue={formik.values.code || ''}
                    setOtpValue={(code) => formik.setFieldValue('code', code)}
                  />
                </div>
                <div className={styles.sendAgainWrapper}>
                  <span>{t('not_received_sms')}</span>
                  <button className={styles.sendAgainButton}>
                    {t('send_sms_code_again')}
                  </button>
                </div>
              </>
            )
          }
          default:
            return null
        }
      })()}
      <div className={styles.wrapperButtons}>
        <Button
          variant="primary"
          disabled={!(formik.isValid && formik.dirty)}
          type="submit"
          className={styles.confirm}
        >
          {textButton}
        </Button>
        <Button variant="secondary" onClick={handlePrevStep} type="button">
          {t('back')}
        </Button>
      </div>
    </form>
  )
}
