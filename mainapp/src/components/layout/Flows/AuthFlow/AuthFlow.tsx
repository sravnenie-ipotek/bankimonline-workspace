// import { Formik } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'

// // import { AuthForm } from '@components/ui/AuthForm'
// import { CodeVerification } from '@components/ui/CodeVerification'
// import {
//   activeTabSelector,
//   authStepSelector,
//   setAuthSteps,
// } from '@src/store/slices/authSlice.ts'
// import { cancelDialog } from '@src/store/slices/dialogSlice.ts'

// import { EAuthSteps } from '../../../../../types/enums/authSteps.enum.ts'

// export interface IInitialValuesState {
//   email: string | null
//   phone: string | null
//   password: string | null
//   code: string | null
// }
// export function AuthFlow() {
//   const dispatch = useDispatch()
//   const authStep = useSelector(authStepSelector)
//   const activeTab = useSelector(activeTabSelector)

//   const { t, i18n } = useTranslation()

//   const handlePreviousStep = () => {
//     dispatch(setAuthSteps(EAuthSteps.Auth))
//   }
//   const handleAuthCodeStep = async (code: string, formik: any) => {
//     try {
//       if (code !== '0000') {
//         formik.resetForm()
//         formik.setErrors({ code: 'Неверный код' })
//         return
//       }
//       // запрос
//       dispatch(cancelDialog())
//       dispatch(setAuthSteps(EAuthSteps.Auth))
//     } catch (e) {
//       // if (code !== '0000') {
//       //   formik.resetForm()
//       //   formik.setErrors({ code: 'Неверный код' })
//       //   return
//       // }
//     }
//   }
//   return (
//     <Formik
//       initialValues={
//         {
//           email: null,
//           phone: null,
//           password: null,
//           code: null,
//         } as Partial<IInitialValuesState>
//       }
//       onSubmit={() => {}}
//     >
//       {
//         {
//           [EAuthSteps.Auth]: <AuthForm />,
//           [EAuthSteps.Code]: (
//             <CodeVerification<IInitialValuesState>
//               handleNextStep={handleAuthCodeStep}
//               tab={activeTab}
//               handlePrevStep={handlePreviousStep}
//               title={t('accept_you_profile_for_enter')}
//               textButton={
//                 activeTab === 'phone' ? t('accept_phone') : t('accept_email')
//               }
//             />
//           ),
//         }[authStep]
//       }
//     </Formik>
//   )
// }
