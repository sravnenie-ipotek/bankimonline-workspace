// import cn from 'classnames'
// import { ChangeEvent, ReactNode, useId } from 'react'

// import { MessageIcon } from '@assets/icons/MessageIcon'
// import ErrorBlock from '@components/ui/ErrorBlock'

// import styles from './TextField.module.scss'

// interface TextFieldProps {
//   icon?: ReactNode
//   type: string
//   label?: string
//   note?: string
//   value: string
//   placeholder?: string
//   language?: string
//   error?: string | string[]
//   handleChange: (value: string | null) => void
// }
// export function TextField({
//   icon,
//   type,
//   label,
//   note,
//   value,
//   placeholder,
//   handleChange,
//   error,
//   language,
// }: TextFieldProps) {
//   const id = useId()
//   const handleChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
//     const newValue = event.target.value
//     handleChange(newValue)
//   }

//   return (
//     <div className={styles.wrapper}>
//       {label && (
//         <label className={styles.label} htmlFor={id}>
//           {label}
//           {note && <span className={styles.note}> {note}</span>}
//         </label>
//       )}
//       <div className="relative w-full">
//         {/* <input
//           id={id}
//           type={type}
//           value={value}
//           placeholder={placeholder}
//           className={cn(
//             styles.textField,
//             {
//               ru: [styles.inputRU],
//               he: [styles.inputHE],
//             }[language]
//           )}
//           onChange={handleChangeValue}
//         /> */}
//         {/* <div
//           className={cn(
//             styles.icon,
//             {
//               ru: [styles.iconRU],
//               he: [styles.iconHE],
//             }[language]
//           )}
//         >
//           {icon && <MessageIcon size={24} color="white" />}
//         </div> */}
//       </div>
//       {error && !!error.length && <ErrorBlock error={error} />}
//     </div>
//   )
// }
