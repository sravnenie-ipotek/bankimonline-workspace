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

import styles from './serviceLine.module.scss'

const cx = classNames.bind(styles)

interface ServiceLineProps {
  title: string
}

const ServiceLine: React.FC<ServiceLineProps> = ({
  title,
}: ServiceLineProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const theme = useTheme()

  const { t } = useTranslation()

  const secondaryIconColor = theme?.colors?.textTheme.primary

  const { isMediumTablet, isDesktop } = useWindowResize()

  const { nav } = useRoute()

  return (
    <div className={cx(styles.pageServiceLine)}>
      <p className={cx(styles.pageFormTitle)}>{title}</p>
      {/*Кнопка поддежки*/}
      {(isMediumTablet || isDesktop) && (
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

export default ServiceLine
