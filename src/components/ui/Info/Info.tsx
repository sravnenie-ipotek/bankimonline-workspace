import classNames from 'classnames/bind'

import { InfoIcon } from '../../../assets/icons/InfoIcon'
import styles from './info.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  title?: string
}
const Info: React.FC<TypeProps> = ({ title }: TypeProps) => {
  return (
    <div className={cx('info')}>
      <InfoIcon className={cx('info-icon')} size={24} />
      <p className={cx('info-title')}>{title}</p>
    </div>
  )
}

export default Info
