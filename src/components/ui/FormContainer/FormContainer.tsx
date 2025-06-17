import classNames from 'classnames/bind'

import styles from './formContainer.module.scss'

const cx = classNames.bind(styles)

const FormContainer = ({ children }: { children?: React.ReactNode }) => {
  return <div className={cx('form-container')}>{children}</div>
}

export default FormContainer
