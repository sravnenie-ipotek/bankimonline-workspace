import classNames from 'classnames/bind'
import { useNavigate } from 'react-router'

import styles from './logo.module.scss'

const cx = classNames.bind(styles)
export default function Logo() {
  const navigate = useNavigate()
  return (
    <a onClick={() => navigate('/')}>
      <img
        alt="Bankimonline logo"
        src="/static/primary-logo05-1.svg"
        className={cx(`logo`)}
      />
    </a>
  )
}
