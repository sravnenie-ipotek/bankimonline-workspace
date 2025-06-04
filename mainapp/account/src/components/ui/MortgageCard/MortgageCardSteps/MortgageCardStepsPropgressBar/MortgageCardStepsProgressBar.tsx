import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { ProgressBar } from '@src/components/ui/ProgressBar'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './mortgageCardStepsProgressBar.module.scss'

const cx = classNames.bind(styles)
const MortgageCardStepsProgressBar: React.FC<{ progress: number }> = ({
  progress,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  return (
    <div className={cx(styles.mortgageCardProgressBar)}>
      <ProgressBar progress={progress} />
      <p className={cx(styles.mortgageCardProgressBarText)}>
        {isRussian
          ? `${t('mortageCard.mortgageCardSteps.progressBarText')} ${progress}%`
          : `%${progress} ${t(
              'mortageCard.mortgageCardSteps.progressBarText'
            )}`}
      </p>
    </div>
  )
}

export default MortgageCardStepsProgressBar
