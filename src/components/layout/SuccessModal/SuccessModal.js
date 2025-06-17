// import { useTranslation } from 'react-i18next'
// import { useDispatch } from 'react-redux'
// import { SuccessIcon } from '@assets/icons/SuccessIcon'
// import { AuthFlow } from '@components/layout/Flows/AuthFlow'
// import {
//   setAuthSteps,
//   setRestorePasswordSteps,
// } from '@src/store/slices/authSlice.ts'
// import { cancelDialog, setDialog } from '@src/store/slices/dialogSlice.ts'
// import { EAuthSteps } from '../../../../types/enums/authSteps.enum.ts'
// import { ERestorePasswordSteps } from '../../../../types/enums/restorePasswordSteps.enum'
// import styles from './SuccessModal.module.scss'
// export function SuccessModal() {
//   const { t, i18n } = useTranslation()
//   i18n.language = i18n.language?.split('-')[0]
//   const dispatch = useDispatch()
//   const handleClick = () => {
//     dispatch(setRestorePasswordSteps(ERestorePasswordSteps.TypeVerify))
//     dispatch(
//       setDialog({
//         content: <AuthFlow />,
//         onClose: () => dispatch(setAuthSteps(EAuthSteps.Auth)),
//       })
//     )
//   }
//   const handleClose = () => {
//     dispatch(setRestorePasswordSteps(ERestorePasswordSteps.TypeVerify))
//     dispatch(cancelDialog())
//   }
//   return (
//     <div className="flex justify-center items-center gap-2 flex-col max-w-[600px] w-[80vw]">
//       <div>
//         <SuccessIcon size={80} color="#FBE54D" />
//         <h3 className="text-white text-xl font-normal">
//           {t('success_restore_password')}
//         </h3>
//       </div>
//       <div>
//         <button onClick={handleClick} className={styles.enter}>
//           {t('enter')}
//         </button>
//         <button onClick={handleClose} className={styles.close}>
//           {t('close')}
//         </button>
//       </div>
//     </div>
//   )
// }
