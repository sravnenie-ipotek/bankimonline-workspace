import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader } from '@components/layout/Loader'
import { ProgressBar } from '@components/ui/ProgressBar'
import { NotFound } from '@src/app/Errors/NotFound'
import { useAppSelector } from '@src/hooks/store'

import { FirstStep } from './pages/FirstStep'
import { FourthStep } from './pages/FourthStep'
import { SecondStep } from './pages/SecondStep'
import { ThirdStep } from './pages/ThirdStep'

const RefinanceCredit = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()
  i18n.language = i18n.language.split('-')[0]

  const navigate = useNavigate()
  const isLogin = useAppSelector((state) => state.login.isLogin)

  if (!isLogin && stepNumber !== '1') {
    navigate('/services/refinance-credit/1')
    return
  }

  const data = [
    t('mortgage_refinance_step_1'),
    t('mortgage_refinance_step_2'),
    t('mortgage_refinance_step_3'),
    t('mortgage_refinance_step_4'),
  ]

  let stepComponent

  switch (stepNumber) {
    case '1':
      stepComponent = <FirstStep />
      break
    case '2':
      stepComponent = <SecondStep />
      break
    case '3':
      stepComponent = <ThirdStep />
      break
    case '4':
      stepComponent = <FourthStep />
      break
    default:
      stepComponent = <NotFound type={'NOT_FOUND'} />
      break
  }

  return (
    <>
      <ProgressBar progress={stepNumber} data={data} />
      <Suspense fallback={<Loader />}>{stepComponent}</Suspense>
    </>
  )
}

export default RefinanceCredit
