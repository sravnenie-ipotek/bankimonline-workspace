/**
 * 🛡️ CRITICAL AI PROTECTION ZONE 🚨
 * 
 * ⚠️  WARNING: This file contains critical business logic
 * 
 * PROTECTION RULES:
 * - DO NOT modify this file without explicit user request
 * - DO NOT refactor, optimize, or "improve" this code
 * - DO NOT change variable names, structure, or logic
 * - DO NOT add new features or functionality
 * - DO NOT modify imports or dependencies
 * - DO NOT change component props or interfaces
 * - DO NOT modify step routing logic or navigation
 * - DO NOT change step component mapping
 * - ONLY modify if user specifically asks for changes
 * 
 * BUSINESS CRITICAL:
 * - This file is the main orchestrator for the entire mortgage calculation flow
 * - Changes could affect the entire mortgage calculation user experience
 * - Contains critical step routing and navigation logic
 * - Requires thorough testing before any modifications
 * - Affects all four mortgage calculation steps
 * 
 * Last modified: 2025-08-07
 * Protected by: Michael Mishayev
 * File purpose: Main mortgage calculation orchestrator - Routes between steps 1-4
 * 
 * To allow AI modifications, add: "ALLOW_AI_MODIFICATIONS: true"
 * To allow specific modifications, add: "ALLOW_MODIFICATIONS: [specific_type]"
 */

import { Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { Loader } from '@components/layout/Loader'
import { ProgressBar } from '@components/ui/ProgressBar'
import NotFound from '@src/app/Errors/NotFound/NotFound.tsx'
import { useAppSelector } from '@src/hooks/store'
import { useContentApi } from '@src/hooks/useContentApi'
import { FirstStep } from '@src/pages/Services/pages/CalculateMortgage/pages/FirstStep'
import { FourthStep } from '@src/pages/Services/pages/CalculateMortgage/pages/FourthStep'
import { SecondStep } from '@src/pages/Services/pages/CalculateMortgage/pages/SecondStep'
import { ThirdStep } from '@src/pages/Services/pages/CalculateMortgage/pages/ThirdStep'

const CalculateMortgage = () => {
  const { stepNumber } = useParams()
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_calculation')

  const navigate = useNavigate()

  const isLogin = useAppSelector((state) => state.login.isLogin)

  useEffect(() => {
    if (!isLogin && stepNumber !== '1') {
      navigate('/services/calculate-mortgage/1')
    }
  }, [isLogin, stepNumber, navigate])

  const data = [
    getContent('mobile_step_1', 'mobile_step_1'),
    getContent('mobile_step_2', 'mobile_step_2'),
    getContent('mobile_step_3', 'mobile_step_3'),
    getContent('mobile_step_4', 'mobile_step_4'),
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
