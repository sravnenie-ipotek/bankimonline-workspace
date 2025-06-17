import classNames from 'classnames/bind'
import React from 'react'

import { ErrorType } from '@src/app/Errors/NotFound/types'

import '../NotFound.module.scss'
import styles from '../NotFound.module.scss'
import Button from './Button.tsx'
import Greeting from './Greeting.tsx'
import Stripe from './Stripe.tsx'

const cx = classNames.bind(styles)

const Body: React.FC<ErrorType> = ({ type }) => {
  return (
    <>
      <div className={cx(`notfound-body`)}>
        <div className={cx(`notfound-actions`)}>
          <Greeting type={type} />
          <Button />
        </div>
      </div>
      <Stripe />
    </>
  )
}

export default Body
