import OtpInput from 'react-otp-input'

import styles from './CodeInput.module.scss'

interface ICodeInputProps {
  otpValue: string | undefined
  setOtpValue: (code: string) => void
  error?: string | string[]
}
export function CodeInput({ otpValue, setOtpValue, error }: ICodeInputProps) {
  return (
    <>
      <OtpInput
        onChange={setOtpValue}
        containerStyle={styles.wrapper}
        value={otpValue}
        inputType="tel"
        numInputs={4}
        renderInput={(props) => (
          <input {...props} className={styles.itemCode} />
        )}
      />
      {error && !!error.length && <div className={styles.error}>{error}</div>}
    </>
  )
}
