import React, { useEffect } from 'react'

import { AppRoutes } from '@src/app/AppRoutes'
import { ErrorBoundary } from '@src/app/Errors'
import { useAppDispatch, useAppSelector } from '@src/hooks/store.ts'
import { updateWindowSize } from '@src/store/slices/windowSizeSlice.ts'

import { debounce } from '../../utils/heplers/debounce.ts'
import { RootState } from '../store'

const App: React.FC = () => {
  // const { t } = useTranslation()
  // const dispatch = useAppDispatch()
  const { currentFont, direction } = useAppSelector(
    (state: RootState) => state.language
  )

  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleResize = debounce(() => {
      dispatch(
        updateWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      )
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [dispatch])

  // const handleLanguageChange = async (language: string) => {
  //   try {
  //     await i18n.changeLanguage(language)
  //     dispatch(changeLanguage(language))
  //   } catch (error) {
  //     console.error('Error changing language:', error)
  //   }
  // }

  useEffect(() => {
    /*
      Проверка - авторизован ли пользователь
    */

    // const token = localStorage.getItem('ACCESS_TOKEN')
    // if (!token) {
    //   window.location.href = 'https://dev2.bankimonline.com'
    // }

    document.documentElement.setAttribute('dir', direction)
    document.documentElement.setAttribute('lang', currentFont.split('-')[1])
  }, [currentFont, direction])

  return (
    <div className={`${currentFont} ${direction}`} dir={direction}>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </div>
  )
}

export default App
