import classNames from 'classnames/bind'

import styles from './rowTwo.module.scss'

const cx = classNames.bind(styles)
const RowTwo = ({ children }: { children: React.ReactNode }) => {
  return <div className={cx('row')}>{children}</div>
}

export default RowTwo
