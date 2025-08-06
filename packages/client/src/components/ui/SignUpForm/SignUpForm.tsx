// import cn from 'classnames'
// import { useFormik, useFormikContext } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'

// import { LogoPrimaryIcon } from '@assets/icons/LogoPrimaryIcon'
// import { MessageIcon } from '@assets/icons/MessageIcon'
// import { AuthFlow } from '@components/layout/Flows/AuthFlow'
// import { IInitialValuesState } from '@components/layout/Flows/SignUpFlow/SignUpFlow.tsx'
// import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts'
// import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts'
// import { Button } from '@components/ui/CustomButton'
// import { CustomPhoneInput } from '@components/ui/CustomPhoneInput/PhoneInput.tsx'
// import { PasswordInput } from '@components/ui/PasswordInput'
// import { Tabs } from '@components/ui/Tabs'
// import { TextField } from '@components/ui/TextField'
// import { useSignUpMutation } from '@src/services/auth/auth.ts'
// import {
//   Tab,
//   activeTabSelector,
//   setActiveTab,
//   setSignUpSteps,
// } from '@src/store/slices/authSlice.ts'
// import { setDialog } from '@src/store/slices/dialogSlice.ts'
// import { tabsMockHE, tabsMockRU } from '@src/utils/constants/mockData/Tabs.ts'

// import bank from '../../../../static/sign-up/bank.png'
// import { ESignUpSteps } from '../../../../types/enums/signUpSteps.enum.ts'
// import styles from './SignUpForm.module.scss'

// export function SignUpForm() {
//   const dispatch = useDispatch()
//   const activeTab = useSelector(activeTabSelector)

//   const { t, i18n } = useTranslation()

//   const formikContext = useFormikContext<IInitialValuesState>()
//   const [signUp] = useSignUpMutation()
//   const formik = useFormik<Omit<IInitialValuesState, 'code'>>({
//     initialValues: {
//       name: formikContext.values.name,
//       email: formikContext.values.email,
//       phone: formikContext.values.phone,
//       password: formikContext.values.password,
//       confirmPassword: formikContext.values.confirmPassword,
//     },
//     onSubmit: async (values) => {
//       // alert(JSON.stringify(values, null, 2))
//       await signUp({
//         ...values,
//       })
//       await formikContext.setValues({ ...formikContext.values, ...values })
//       dispatch(setSignUpSteps(ESignUpSteps.Code))
//     },
//     validationSchema:
//       i18n.language === 'he'
//         ? validationSchemaHE.SignUpFlow.SignUpForm
//         : validationSchemaRU.SignUpFlow.SignUpForm,
//     validateOnMount: false,
//   })

//   const handleAuth = () => {
//     dispatch(
//       setDialog({
//         content: <AuthFlow />,
//         onClose: () => dispatch(setSignUpSteps(ESignUpSteps.SignUp)),
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
//     <form onSubmit={formik.handleSubmit} className={styles.mainWrapper}>
//       <div className={styles.presentation}>
//         <div className={styles.logoIcon}>
//           <LogoPrimaryIcon color="#161616" />
//         </div>
//         <h2 className={styles.infoTitle}>{t('register_banner_title')}</h2>
//         <p className={styles.infoDescr}>{t('register_banner_description')}</p>
//         <div className={styles.wrapperImgs}>
//           <img className={styles.bank} src={bank} alt="bank" />
//         </div>
//       </div>

//       <div className={styles.form}>
//         <h2 className={styles.formTitle}>{t('register_title')}</h2>
//         <p className={styles.formDescr}>{t('register_description')}</p>

//         <Tabs<Tab>
//           handleChange={handleChangeTab}
//           tab={activeTab}
//           tabs={i18n.language === 'he' ? tabsMockHE : tabsMockRU}
//         />
//         <div className={styles.formWrapper}>
//           <TextField
//             language={i18n.language}
//             error={formik.errors.name}
//             type="text"
//             value={formik.values.name || ''}
//             placeholder={t('add_name')}
//             label={t('name_surname')}
//             note={t('like_passport')}
//             handleChange={(name) => formik.setFieldValue('name', name)}
//           />
//           {activeTab === 'phone' ? (
//             <CustomPhoneInput
//               error={formik.errors.phone}
//               title={t('phone_number')}
//               value={formik.values.phone || ''}
//               handleChange={(phone) => formik.setFieldValue('phone', phone)}
//             />
//           ) : (
//             <TextField
//               error={formik.errors.email}
//               value={formik.values.email || ''}
//               type="text"
//               placeholder="mail@mail.com"
//               label={t('email')}
//               icon={<MessageIcon />}
//               handleChange={(email) => formik.setFieldValue('email', email)}
//             />
//           )}
//           <PasswordInput
//             language={i18n.language}
//             error={formik.errors.password}
//             value={formik.values.password || ''}
//             label={t('create_password')}
//             handleChange={(password) =>
//               formik.setFieldValue('password', password)
//             }
//             placeholder={t('password')}
//           />
//           <PasswordInput
//             language={i18n.language}
//             error={formik.errors.confirmPassword}
//             label={t('confirm_password')}
//             value={formik.values.confirmPassword || ''}
//             handleChange={(confirmPassword) =>
//               formik.setFieldValue('confirmPassword', confirmPassword)
//             }
//             placeholder={t('password')}
//           />
//         </div>
//         <p className={styles.policy}>
//           {t('press_register')}
//           <span className={styles.link}> {t('user_agreement')} </span>
//           {t('agreement')} <span className={styles.link}> {t('policy')}</span>
//         </p>
//         <Button
//           disabled={!(formik.isValid && formik.dirty)}
//           type="submit"
//           variant="primary"
//           className={styles.button}
//         >
//           {t('registration')}
//         </Button>
//         <p className={cn(styles.policy, styles.auth)}>
//           {t('has_account')}
//           <span onClick={handleAuth} className={styles.link}>
//             {t('here')}
//           </span>
//         </p>
//       </div>
//     </form>
//   )
// }
