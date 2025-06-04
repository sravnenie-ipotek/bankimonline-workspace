import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { MortgageCardStepsProgressBar } from '@src/components/ui/MortgageCard/MortgageCardSteps/MortgageCardStepsPropgressBar'
import { MortgageCardStepsTitle } from '@src/components/ui/MortgageCard/MortgageCardSteps/MortgageCardStepsTitle'
import { QuestionnaryAction } from '@src/components/ui/MortgageCard/MortgageCardSteps/QuestionnaryAction'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './mortgageCardSteps.module.scss'

interface MortgageCardStepsProps {
  progress: number //прогресс заполнения документов
  profileStatus: string // статус анкеты
  documentsStatus: string // статус документа
  coBorrowers?: {
    //созаёмщики
    [key: string]: {
      //созаёмщик
      profileStatus: 'accepted' | 'required' | 'nonAccepted' //статус анкеты созаёмщика
      documentsStatus: 'accepted' | 'required' | 'nonAccepted' //статус документов созаёмщика
    }
  }
}

const cx = classNames.bind(styles)

const MortgageCardSteps: React.FC<MortgageCardStepsProps> = ({
  progress,
  profileStatus,
  documentsStatus,
  coBorrowers,
}: MortgageCardStepsProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  return (
    <div className={cx(styles.mortgageCardStepsMainWrapper)}>
      <div className={cx(styles.mortgageCardStepsWrapper)}>
        <MortgageCardStepsTitle
          text={
            progress === 100
              ? t('mortageCard.mortgageCardSteps.stepsTitleFull')
              : t('mortageCard.mortgageCardSteps.stepsTitle')
          }
        />
        <div className={cx(styles.mortgageCardProgressBar)}>
          <MortgageCardStepsProgressBar progress={progress} />
        </div>
        <div className={cx(styles.questionnaireDetails)}>
          <QuestionnaryAction to={'/'} status={profileStatus}>
            {t('mortageCard.mortgageCardSteps.profileStatusTitle')}
          </QuestionnaryAction>
          <QuestionnaryAction to={'/documents'} status={documentsStatus}>
            {t('mortageCard.mortgageCardSteps.documentsStatusTitle')}
          </QuestionnaryAction>
        </div>

        {coBorrowers &&
          Object.entries(coBorrowers).map((coBorrower: any, index: number) => (
            <div className={cx(styles.questionnaireDetails)} key={index}>
              <QuestionnaryAction to={'/'} status={coBorrower[1].profileStatus}>
                {index === 0
                  ? t(
                      'mortageCard.mortgageCardSteps.coBorrowerProfileStatusTitleOne'
                    )
                  : isRussian
                  ? `${t(
                      'mortageCard.mortgageCardSteps.coBorrowerProfileStatusTitleMore'
                    )}${index + 1}`
                  : `${index + 1}${t(
                      'mortageCard.mortgageCardSteps.coBorrowerProfileStatusTitleMore'
                    )}`}
              </QuestionnaryAction>
              <QuestionnaryAction
                to={'/documents'}
                status={coBorrower[1].documentsStatus}
              >
                {index === 0
                  ? t(
                      'mortageCard.mortgageCardSteps.coBorrowerDocumentsStatusTitleOne'
                    )
                  : isRussian
                  ? `${t(
                      'mortageCard.mortgageCardSteps.coBorrowerDocumentsStatusTitleMore'
                    )}${index + 1}`
                  : `${index + 1}${t(
                      'mortageCard.mortgageCardSteps.coBorrowerDocumentsStatusTitleMore'
                    )}`}
              </QuestionnaryAction>
            </div>
          ))}
      </div>
    </div>
  )
}

export default MortgageCardSteps
