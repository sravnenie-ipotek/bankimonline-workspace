// import { Formik } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'
// import { SuccessModal } from '@components/layout/SuccessModal'
// import { CodeVerification } from '@components/ui/CodeVerification'
// import { RestorePassword } from '@components/ui/RestorePassword'
// import { TypeVerify } from '@components/ui/TypeVerify'
// import {
//   activeTabSelector,
//   restorePasswordStepSelector,
//   setRestorePasswordSteps,
// } from '@src/store/slices/authSlice.ts'
// import { ERestorePasswordSteps } from '../../../../../types/enums/restorePasswordSteps.enum.ts'
// export interface IInitialValuesState {
//   email: string | null
//   phone: string | null
//   code: string | null
//   password: string | null
//   confirmPassword: string | null
// }
// export function RestoreFlow() {
//   const dispatch = useDispatch()
//   const restorePasswordStep = useSelector(restorePasswordStepSelector)
//   const activeTab = useSelector(activeTabSelector)
//   const { t, i18n } = useTranslation()
//   i18n.language = i18n.language?.split('-')[0]
//   const handleVerifyStep = () => {
//     dispatch(setRestorePasswordSteps(ERestorePasswordSteps.TypeVerify))
//   }
//   const handleRestorePasswordStep = async (code: string, formik: any) => {
//     try {
//       if (code !== '0000') {
//         formik.resetForm()
//         formik.setErrors({ code: 'Неверный код' })
//         return
//       }
//       // запрос
//       dispatch(setRestorePasswordSteps(ERestorePasswordSteps.RestorePassword))
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
//           code: null,
//           password: null,
//           confirmPassword: null,
//         } as IInitialValuesState
//       }
//       onSubmit={() => {}}
//     >
//       {
//         {
//           [ERestorePasswordSteps.TypeVerify]: <TypeVerify />,
//           [ERestorePasswordSteps.Code]: (
//             <CodeVerification<IInitialValuesState>
//               handleNextStep={handleRestorePasswordStep}
//               handlePrevStep={handleVerifyStep}
//               tab={activeTab}
//               title={t('accept_you_profile_for_enter')}
//               textButton={
//                 activeTab === 'phone' ? t('accept_phone') : t('accept_email')
//               }
//             />
//           ),
//           [ERestorePasswordSteps.RestorePassword]: <RestorePassword />,
//           [ERestorePasswordSteps.Success]: <SuccessModal />,
//         }[restorePasswordStep]
//       }
//     </Formik>
//   )
// }
