import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { Plus } from '@assets/icons/Plus'
import { Button } from '@src/components/ui/Button'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import styles from './documentsTitle.module.scss'

const cx = classNames.bind(styles)

interface QuestionnaireTitleProps {
  //
}

const DocumentsTitle: React.FC<QuestionnaireTitleProps> = () => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMobile } = useWindowResize()

  const theme = useTheme()

  const { t } = useTranslation()

  const secondaryIconColor = theme?.colors?.textTheme.primary

  return (
    <div className={cx(styles.pageTopLine)}>
      <p className={cx(styles.pageTitle)}>{t('documents.title')}</p>
      {!isMobile && (
        <div>
          <Button variant="secondary" view="flex" className="h-[40px]">
            <div
              className={cx({
                'mr-[0.6rem]': isRussian,
                'ml-[0.6rem]': !isRussian,
              })}
            >
              <Plus color={secondaryIconColor} size={24} />
            </div>
            {t('documents.addCoBorrower')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default DocumentsTitle
