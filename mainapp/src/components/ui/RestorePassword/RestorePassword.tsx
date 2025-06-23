// import { useFormik, useFormikContext } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch } from 'react-redux'

// import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts'
// import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts'
// import { Button } from '@components/ui/CustomButton'
// import { PasswordInput } from '@components/ui/PasswordInput'
// import { IInitialValuesState } from '@src/components/layout/Flows/RestoreFlow/RestoreFlow'
// import { setRestorePasswordSteps } from '@src/store/slices/authSlice.ts'

// import { ERestorePasswordSteps } from '../../../../types/enums/restorePasswordSteps.enum'
// import styles from './RestorePassword.module.scss'

// export function RestorePassword() {
//   const { t, i18n } = useTranslation()

//   const formikContext = useFormikContext<IInitialValuesState>()
//   const formik = useFormik<
//     Pick<IInitialValuesState, 'password' | 'confirmPassword'>
//   >({
//     initialValues: {
//       password: formikContext.values.password,
//       confirmPassword: formikContext.values.confirmPassword,
//     },
//     onSubmit: async (values) => {
//       await formikContext.setValues({ ...formikContext.values, ...values })
//       dispatch(setRestorePasswordSteps(ERestorePasswordSteps.Success))
//     },
//     validationSchema:
//       i18n.language === 'he'
//         ? validationSchemaHE.RestorePasswordFlow.RestorePassword
//         : validationSchemaRU.RestorePasswordFlow.RestorePassword,
//   })
//   const dispatch = useDispatch()

//   return (
//     <form className={styles.wrapper} onSubmit={formik.handleSubmit}>
//       <h2 className={styles.title}>{t('choose_new_password')}</h2>
//       <p className={styles.descr}>{t('new_password')}</p>
//       <div className={styles.wrapper}>
//         <PasswordInput
//           language={i18n.language}
//           error={formik.errors.password}
//           label={t('choose_new_password')}
//           value={formik.values.password || ''}
//           placeholder={t('new_password')}
//           handleChange={(password) =>
//             formik.setFieldValue('password', password)
//           }
//         />
//         <PasswordInput
//           language={i18n.language}
//           error={formik.errors.confirmPassword}
//           label={t('confirmed_password')}
//           value={formik.values.confirmPassword || ''}
//           placeholder={t('confirmed_password')}
//           handleChange={(confirmPassword) =>
//             formik.setFieldValue('confirmPassword', confirmPassword)
//           }
//         />
//       </div>
//       <Button
//         type="submit"
//         variant="primary"
//         disabled={!(formik.isValid && formik.dirty)}
//         className={styles.changeButton}
//       >
//         {t('change_password')}
//       </Button>
//     </form>
//   )
// }
