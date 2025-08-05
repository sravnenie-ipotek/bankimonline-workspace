import React from 'react'

import { ErrorType } from '@src/app/Errors/NotFound/types'

import './NotFound.module.scss'
import Body from './components/Body.tsx'

// Компонент ненайденной страницы
const NotFound: React.FC<ErrorType> = ({ type }) => {
  return (
    <>
      <Body type={type} />
    </>
  )
}

export default NotFound
