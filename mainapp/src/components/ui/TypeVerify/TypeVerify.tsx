// import { useFormik, useFormikContext } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'

// import { MessageIcon } from '@assets/icons/MessageIcon'
// import { IInitialValuesState } from '@components/layout/Flows/RestoreFlow/RestoreFlow.tsx'
// import { validationSchemaHE } from '@components/layout/Flows/validations/validationSchemaHE.ts'
// import { validationSchemaRU } from '@components/layout/Flows/validations/validationSchemaRU.ts'
// import { Button } from '@components/ui/CustomButton'
// import { CustomPhoneInput } from '@components/ui/CustomPhoneInput/PhoneInput.tsx'
// import { Tabs } from '@components/ui/Tabs'
// import { TextField } from '@components/ui/TextField'
// import {
//   Tab,
//   activeTabSelector,
//   setActiveTab,
//   setRestorePasswordSteps,
// } from '@src/store/slices/authSlice.ts'
// import { tabsMockHE, tabsMockRU } from '@src/utils/constants/mockData/Tabs.ts'

// import { ERestorePasswordSteps } from '../../../../types/enums/restorePasswordSteps.enum.ts'
// import styles from './TypeVerify.module.scss'

// export function TypeVerify() {
//   const dispatch = useDispatch()
//   const formikContext = useFormikContext<IInitialValuesState>()
//   const activeTab = useSelector(activeTabSelector)
//   const { t, i18n } = useTranslation()

//   const formik = useFormik<Pick<IInitialValuesState, 'phone' | 'email'>>({
//     initialValues: {
//       email: formikContext.values.email,
//       phone: formikContext.values.phone,
//     },
//     onSubmit: async (values) => {
//       alert(JSON.stringify(values, null, 2))
//       await formikContext.setValues({ ...formikContext.values, ...values })
//       dispatch(setRestorePasswordSteps(ERestorePasswordSteps.Code))
//     },
//     validationSchema:
//       i18n.language === 'he'
//         ? validationSchemaHE.RestorePasswordFlow.TypeVerify
//         : validationSchemaRU.RestorePasswordFlow.TypeVerify,
//   })

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
//     <form onSubmit={formik.handleSubmit}>
//       <h2 className={styles.title}>{t('title_restore_password')}</h2>
//       <p className={styles.descr}>{t('sms_code')}</p>
//       <div className={styles.wrapper}></div>
//       <Tabs<Tab>
//         handleChange={handleChangeTab}
//         tab={activeTab}
//         tabs={i18n.language === 'he' ? tabsMockHE : tabsMockRU}
//       />
//       <div className="mt-6 mb-6">
//         {activeTab === 'phone' ? (
//           <CustomPhoneInput
//             language={i18n.language}
//             label={t('phone_number')}
//             value={formik.values.phone || ''}
//             country={i18n.language === 'he' ? 'il' : 'ru'}
//             handleChange={(phone) => formik.setFieldValue('phone', phone)}
//             error={formik.errors.phone}
//           />
//         ) : (
//           <TextField
//             language={i18n.language}
//             value={formik.values.email || ''}
//             type="text"
//             icon={<MessageIcon />}
//             placeholder="mail@mail.com"
//             label={t('email')}
//             handleChange={(email) => formik.setFieldValue('email', email)}
//             error={formik.errors.email}
//           />
//         )}
//       </div>

//       <Button
//         variant="primary"
//         disabled={!(formik.isValid && formik.dirty)}
//         type="submit"
//       >
//         {t('get_code')}
//       </Button>
//     </form>
//   )
// }
