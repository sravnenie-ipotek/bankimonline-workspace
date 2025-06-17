// import { useFormik, useFormikContext } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'
// import { MessageIcon } from '@assets/icons/MessageIcon'
// import { IInitialValuesState } from '@components/layout/Flows/AuthFlow/AuthFlow.tsx'
// import { RestoreFlow } from '@components/layout/Flows/RestoreFlow'
// import { SignUpFlow } from '@components/layout/Flows/SignUpFlow'
// import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts'
// import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts'
// import { Button } from '@components/ui/CustomButton'
// import { CustomPhoneInput } from '@components/ui/CustomPhoneInput/PhoneInput.tsx'
// import { PasswordInput } from '@components/ui/PasswordInput'
// import { Tabs } from '@components/ui/Tabs'
// import { TextField } from '@components/ui/TextField'
// import { useSignInEmailMutation } from '@src/services/auth/auth.ts'
// import {
//   Tab,
//   activeTabSelector,
//   setActiveTab,
//   setAuthSteps,
//   setRestorePasswordSteps,
//   setSignUpSteps,
// } from '@src/store/slices/authSlice.ts'
// import { setDialog } from '@src/store/slices/dialogSlice.ts'
// import { tabsMockHE, tabsMockRU } from '@src/utils/constants/mockData/Tabs.ts'
// import { EAuthSteps } from '../../../../types/enums/authSteps.enum.ts'
// import { ERestorePasswordSteps } from '../../../../types/enums/restorePasswordSteps.enum.ts'
// import { ESignUpSteps } from '../../../../types/enums/signUpSteps.enum.ts'
// import styles from './AuthForm.module.scss'
// export function AuthForm() {
//   const dispatch = useDispatch()
//   const { t, i18n } = useTranslation()
//   i18n.language = i18n.language?.split('-')[0]
//   const activeTab = useSelector(activeTabSelector)
//   const [signInEmail] = useSignInEmailMutation()
//   const formikContext = useFormikContext<IInitialValuesState>()
//   const formik = useFormik<Omit<IInitialValuesState, 'code'>>({
//     initialValues: {
//       email: formikContext.values.email,
//       phone: formikContext.values.phone,
//       password: formikContext.values.password,
//     },
//     onSubmit: async (values) => {
//       // alert(JSON.stringify(values, null, 2))
//       await signInEmail({
//         ...values,
//       })
//       await formikContext.setValues({ ...formikContext.values, ...values })
//       formik.resetForm()
//       dispatch(setAuthSteps(EAuthSteps.Code))
//     },
//     validationSchema:
//       i18n.language === 'he'
//         ? validationSchemaHE.AuthFlow.AuthForm
//         : validationSchemaRU.AuthFlow.AuthForm,
//     // validateOnMount: false,
//   })
//   const handleSignUp = () => {
//     dispatch(
//       setDialog({
//         content: <SignUpFlow />,
//         onClose: () => dispatch(setSignUpSteps(ESignUpSteps.SignUp)),
//       })
//     )
//   }
//   const handleRestorePassword = () => {
//     dispatch(
//       setDialog({
//         content: <RestoreFlow />,
//         onClose: () =>
//           dispatch(setRestorePasswordSteps(ERestorePasswordSteps.TypeVerify)),
//       })
//     )
//   }
//   async function handleChangeTab(value: Tab) {
//     dispatch(setActiveTab(value))
//     await formik.setValues({
//       ...formik.values,
//       phone: null,
//       email: null,
//     })
//     await formikContext.setValues({ ...formikContext.values, ...formik.values })
//   }
//   return (
//     <div className={styles.wrapper}>
//       <h2 className={styles.title}>{t('enter_bankimonline')}</h2>
//       <Tabs<Tab>
//         handleChange={handleChangeTab}
//         tab={activeTab}
//         tabs={i18n.language === 'he' ? tabsMockHE : tabsMockRU}
//       />
//       <form onSubmit={formik.handleSubmit}>
//         <div className="flex flex-col gap-5 items-start mt-6">
//           <div className={styles.phoneWrapper}>
//             {activeTab === 'phone' ? (
//               <CustomPhoneInput
//                 title={t('phone_number')}
//                 value={formik.values.phone || ''}
//                 handleChange={(phone) => formik.setFieldValue('phone', phone)}
//                 error={formik.errors.phone}
//               />
//             ) : (
//               <TextField
//                 language={i18n.language}
//                 icon={<MessageIcon />}
//                 value={formik.values.email || ''}
//                 type="text"
//                 placeholder="mail@mail.com"
//                 label={t('email')}
//                 handleChange={(email) => formik.setFieldValue('email', email)}
//                 error={formik.errors.email}
//               />
//             )}
//           </div>
//           <PasswordInput
//             language={i18n.language}
//             title={t('password')}
//             placeholder={t('enter_password')}
//             value={formik.values.password || ''}
//             error={formik.errors.password}
//             handleChange={(password) =>
//               formik.setFieldValue('password', password)
//             }
//           />
//           <button
//             type="button"
//             onClick={handleRestorePassword}
//             className={styles.forgotPassword}
//           >
//             {t('forgot_password')}
//           </button>
//           <Button
//             type="submit"
//             variant="primary"
//             className={styles.enter}
//             disabled={!(formik.isValid && formik.dirty)}
//           >
//             {t('enter')}
//           </Button>
//         </div>
//       </form>
//       <div className={styles.signUpWrapper}>
//         <span>{t('no_account')}</span>
//         <button onClick={handleSignUp} className={styles.signUpButton}>
//           {t('register_here')}
//         </button>
//       </div>
//     </div>
//   )
// }
