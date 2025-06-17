// import { Formik } from 'formik'
// import { useTranslation } from 'react-i18next'
// import { useDispatch, useSelector } from 'react-redux'

// import { CodeVerification } from '@components/ui/CodeVerification'
// import { SignUpForm } from '@components/ui/SignUpForm'
// import {
//   activeTabSelector,
//   setSignUpSteps,
//   signUpStepSelector,
// } from '@src/store/slices/authSlice.ts'
// import { cancelDialog } from '@src/store/slices/dialogSlice.ts'

// import { ESignUpSteps } from '../../../../../types/enums/signUpSteps.enum.ts'

// export interface IInitialValuesState {
//   name: string | null
//   email: string | null
//   phone: string | null
//   password: string | null
//   confirmPassword: string | null
//   code: string | null
// }
// export function SignUpFlow() {
//   const dispatch = useDispatch()
//   const activeTab = useSelector(activeTabSelector)
//   const signUpStep = useSelector(signUpStepSelector)

//   const { t, i18n } = useTranslation()
//   i18n.language = i18n.language?.split('-')[0]

//   const handlePreviousStep = () => {
//     dispatch(setSignUpSteps(ESignUpSteps.SignUp))
//   }
//   const handleSignUpCodeStep = async (code: string, formik: any) => {
//     try {
//       if (code !== '0000') {
//         formik.resetForm()
//         formik.setErrors({ code: 'Неверный код' })
//         return
//       }
//       // запрос
//       dispatch(cancelDialog())
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
//           name: null,
//           email: null,
//           phone: null,
//           password: null,
//           confirmPassword: null,
//           code: null,
//         } as IInitialValuesState
//       }
//       onSubmit={() => {}}
//     >
//       {
//         {
//           [ESignUpSteps.SignUp]: <SignUpForm />,
//           [ESignUpSteps.Code]: (
//             <CodeVerification<IInitialValuesState>
//               tab={activeTab}
//               handleNextStep={handleSignUpCodeStep}
//               handlePrevStep={handlePreviousStep}
//               title={t('accept_you_profile_for_registration')}
//               textButton={
//                 activeTab === 'phone' ? t('accept_phone') : t('accept_email')
//               }
//             />
//           ),
//         }[signUpStep]
//       }
//     </Formik>
//   )
// }
