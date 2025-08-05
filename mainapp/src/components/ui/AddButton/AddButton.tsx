import classNames from 'classnames/bind'

import { PlusIcon } from '../../../assets/icons/PlusIcon'
import styles from './addButton.module.scss'

const cx = classNames.bind(styles)

interface PropTypes
  extends React.HTMLProps<HTMLDivElement & HTMLButtonElement> {
  value?: string
  error?: string | boolean
  onClick?: () => void
  variant?: 'outline' | 'none'
  color?: 'yellow' | 'white' | string
  onBlur?: () => void
  type?: 'submit' | 'button'
}

const AddButton: React.FC<PropTypes> = ({
  value,
  error,
  onClick,
  variant = 'none',
  color = '#F5C842',
  ...props
}: PropTypes) => {
  return (
    <div className={cx('wrapper')} {...props}>
      <button
        type="button"
        onClick={onClick}
        className={cx('add-button', `${error && 'error'}`, {
          [`${variant}`]: variant,
        })}
        {...props}
      >
        <PlusIcon color={error ? '#ef4444' : color} />
        <p className={cx('add-button-text')}>{value}</p>
      </button>
    </div>
  )
}

export default AddButton
