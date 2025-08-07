import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { Loader } from '@components/layout/Loader'
import { ProgressBar } from '@components/ui/ProgressBar'
import NotFound from '@src/app/Errors/NotFound/NotFound.tsx'
import { useAppSelector } from '@src/hooks/store'

import { FirstStep } from './pages/FirstStep'
import { FourthStep } from './pages/FourthStep'
import { SecondStep } from './pages/SecondStep'
import { ThirdStep } from './pages/ThirdStep'

const CalculateCredit = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const isLogin = useAppSelector((state) => state.login.isLogin)

  // Fix: Move navigation to useEffect to avoid updating router during render
  useEffect(() => {
    if (!isLogin && stepNumber !== '1') {
      navigate('/services/calculate-credit/1')
    }
  }, [isLogin, stepNumber, navigate])

  // Show loader while redirecting
  if (!isLogin && stepNumber !== '1') {
    return <Loader />
  }

  const data = [
    t('mobile_step_1'),
    t('mobile_step_2'),
    t('mobile_step_3'),
    t('mobile_step_4'),
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

export default CalculateCredit
