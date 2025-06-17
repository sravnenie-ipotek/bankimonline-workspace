import classNames from 'classnames/bind'
import React from 'react'

import { Logo } from '@assets/icons/Logo.tsx'

import Spinner from './Spinner.tsx'
import styles from './loader.module.scss'

const cx = classNames.bind(styles)

const Loader: React.FC = () => {
  return (
    <div
      className={cx(
        `w-full min-h-screen flex flex-col justify-center items-center bg-base-primary`
      )}
    >
      <Logo size={102} />
      <Spinner />
    </div>
  )
}

export default Loader
