import { useAppSelector } from '@src/hooks/store.ts'

import { breakPoints } from '../shared/theme/mediaQueries.ts'

export const useWindowResize = () => {
  const innerWidth = useAppSelector((state) => state.windowSize.width)

  const isDesktop = innerWidth + 1 > parseInt(breakPoints.large)
  const isTablet =
    innerWidth <= parseInt(breakPoints.large) &&
    innerWidth > parseInt(breakPoints.small)
  const isMobile = innerWidth <= parseInt(breakPoints.small)

  return { isDesktop, isTablet, isMobile }
}

// Пример использования

/*

const MyComponent: React.FC = () => {
  const { isDesktop, isTablet, isMobile } = useWindowResize()

  return (
    <div>
      {isDesktop && <p>Вы используете рабочий стол</p>}
      {isTablet && <p>Вы используете планшет</p>}
      {isMobile && <p>Вы используете мобильное устройство</p>}
    </div>
  )
}

*/
