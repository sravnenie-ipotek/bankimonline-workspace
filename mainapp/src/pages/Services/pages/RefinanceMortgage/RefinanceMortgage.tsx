import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader } from '@components/layout/Loader'
import { ProgressBar } from '@components/ui/ProgressBar'
import NotFound from '@src/app/Errors/NotFound/NotFound.tsx'
import { useAppSelector } from '@src/hooks/store'

import { FirstStep } from './pages/FirstStep'
import { FourthStep } from './pages/FourthStep'
import { SecondStep } from './pages/SecondStep'
import { ThirdStep } from './pages/ThirdStep'
import { UploadReport } from './pages/UploadReport'

const RefinanceMortgage = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()
  const isLogin = useAppSelector((state) => state.login.isLogin)

  if (!isLogin && stepNumber !== '1') {
    navigate('/services/refinance-mortgage/1')
    return
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
    case 'upload-report':
      stepComponent = <UploadReport />
      break
    default:
      stepComponent = <NotFound type={'NOT_FOUND'} />
      break
  }

  const progressValue = stepNumber === 'upload-report' ? '1' : stepNumber

  return (
    <>
      {stepNumber !== 'upload-report' && <ProgressBar progress={progressValue} data={data} />}
      {stepNumber === 'upload-report' && <ProgressBar progress="1" data={[t('upload_report_progress'), t('mobile_step_2'), t('mobile_step_3')]} />}
      <Suspense fallback={<Loader />}>{stepComponent}</Suspense>
    </>
  )
}

export default RefinanceMortgage
