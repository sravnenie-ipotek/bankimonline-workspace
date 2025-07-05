import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader } from '@components/layout/Loader'
import { ProgressBar } from '@components/ui/ProgressBar'
import NotFound from '@src/app/Errors/NotFound/NotFound.tsx'
import { useAppSelector } from '@src/hooks/store'
import { FirstStep } from '@src/pages/Services/pages/CalculateMortgage/pages/FirstStep'
import { FourthStep } from '@src/pages/Services/pages/CalculateMortgage/pages/FourthStep'
import { SecondStep } from '@src/pages/Services/pages/CalculateMortgage/pages/SecondStep'
import { ThirdStep } from '@src/pages/Services/pages/CalculateMortgage/pages/ThirdStep'

const CalculateMortgage = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()

  const isLogin = useAppSelector((state) => state.login.isLogin)

  useEffect(() => {
    if (!isLogin && stepNumber !== '1') {
      navigate('/services/calculate-mortgage/1')
    }
  }, [isLogin, stepNumber, navigate])

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
      {stepNumber !== '4' && <ProgressBar progress={stepNumber} data={data} />}
      <Suspense fallback={<Loader />}>{stepComponent}</Suspense>
    </>
  )
}

export default CalculateMortgage
