import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { Caret } from '@assets/icons/Caret'
import { Headphones } from '@assets/icons/Headphones'
import { Button } from '@src/components/ui/Button'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import styles from './homeTitle.module.scss'

const cx = classNames.bind(styles)

interface HomeTitleProps {
  dealType: string
}

const HomeTitle: React.FC<HomeTitleProps> = ({ dealType }: HomeTitleProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMediumTablet, isDesktop } = useWindowResize()

  const theme = useTheme()

  const { t } = useTranslation()

  const { nav } = useRoute()

  const secondaryIconColor = theme?.colors?.textTheme.primary

  return (
    <div className={cx(styles.pageTopLine)}>
      <p className={cx(styles.pageTitle)}>{t('home.title')}</p>
      {dealType === 'none' && (isDesktop || isMediumTablet) && (
        <div
          className={cx(isRussian ? styles.buttonWidthR : styles.buttonWidthI)}
        >
          <Button
            variant="secondary"
            view="flex"
            className="h-[56px]"
            to={nav('support')}
            icon={
              <div
                className={cx({
                  'ml-[1.2rem]': isRussian,
                  'mr-[1.2rem]': !isRussian,
                })}
              >
                <Caret color={secondaryIconColor} />
              </div>
            }
          >
            <div
              className={cx({
                'mr-[0.6rem]': isRussian,
                'ml-[0.6rem]': !isRussian,
              })}
            >
              <Headphones size={24} />
            </div>
            {t('home.support')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default HomeTitle
