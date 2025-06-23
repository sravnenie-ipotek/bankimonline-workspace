import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import NotFound from '@src/app/Errors/NotFound/NotFound.tsx'
import { Loader } from '@src/components/layout/Loader'
import { ProgressBar } from '@src/components/ui/ProgressBar'
import { useAppSelector } from '@src/hooks/store'
import { FirstStep } from '@src/pages/Services/pages/OtherBorrowers/FirstStep'
import { SecondStep } from '@src/pages/Services/pages/OtherBorrowers/SecondStep'

const OtherBorrowers = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()
  const isLogin = useAppSelector((state) => state.login.isLogin)

  if (!isLogin) {
    navigate('/')
    return
  }

  const data = [t('calculate_mortgage_anketa'), t('calculate_mortgage_income')]

  let stepComponent

  switch (stepNumber) {
    case '1':
      stepComponent = <FirstStep />
      break
    case '2':
      stepComponent = <SecondStep />
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

export default OtherBorrowers
