import classNames from 'classnames'
import { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'

import styles from './portal.module.scss'

type PortalProps = {
  children: ReactNode
}

const portal = document.getElementById('modal-root')

const cx = classNames.bind(styles)

const Portal: FC<PortalProps> = ({ children }) => {
  return portal
    ? createPortal(<div className={cx(styles.root)}>{children}</div>, portal)
    : null
}

export default Portal
