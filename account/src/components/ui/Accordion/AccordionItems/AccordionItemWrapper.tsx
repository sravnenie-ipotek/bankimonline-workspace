import classNames from 'classnames/bind'
import { FC, ReactNode } from 'react'

import styles from './AccordionItemWrapper.module.scss'

type AccordionItemWripperProps = {
  children: ReactNode
}

const cx = classNames.bind(styles)

const AccordionItemWripper: FC<AccordionItemWripperProps> = ({ children }) => {
  return <div className={cx('root')}>{children}</div>
}

export default AccordionItemWripper
