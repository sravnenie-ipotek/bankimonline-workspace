import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Plus } from '@assets/icons/Plus'
import { Trash } from '@assets/icons/Trash'
import {
  QuestionnaireData,
  QuestionnaireDataPeople,
} from '@pages/Questionnaire/types'
import { Button } from '@src/components/ui/Button'
import { ExitDeleteModal } from '@src/components/ui/ExitDeleteModal'
import { InformationCard } from '@src/components/ui/InformationCard'
import { Tab } from '@src/components/ui/Tab'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import useTheme from '@src/hooks/useTheme'
import { useWindowResize } from '@src/hooks/useWindowResize'
import { RootState } from '@src/store'

import { QuestionnaireTitle } from '../QuestionnaireTitle'
import styles from './topLayout.module.scss'

const cx = classNames.bind(styles)

interface TopLayoutProps {
  questionnaireData: QuestionnaireData
}

const TopLayout: React.FC<TopLayoutProps> = ({ questionnaireData }) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { isMobile } = useWindowResize()

  const theme = useTheme()

  const { t } = useTranslation()

  const primaryIconColor = theme?.colors?.textTheme.primary
  const delIconColor = theme?.colors?.error.error100

  const [visibleModal, setVisibleModal] = useState(false)

  const { nav } = useRoute()

  //склейка в один массив
  const peoplesData: QuestionnaireDataPeople[] = [
    questionnaireData.user,
    ...(questionnaireData.coBorrowers || []),
  ]

  const delCoBorrower = () => {
    console.log('Удаление созаёмщика')
  }

  const TabData = {
    titles: peoplesData.map((people, index) => (
      <div key={index} className={cx(styles.tabTextStyle)}>
        {people.name}
        {index !== 0 && people.questionnaireStatus !== 'ended' && (
          <div
            className={cx(
              styles.tabTitleRound,
              isRussian ? 'ml-[12px]' : 'mr-[12px]'
            )}
          >
            <p className={cx(styles.tabTitleRoundText)}>1</p>
          </div>
        )}
      </div>
    )),
    content: peoplesData.map((people, index) => (
      <div key={index}>
        <div className="flex w-full justify-between">
          <p className={cx(styles.cardsTitle)}>{people.name}</p>
          {!isMobile && index !== 0 && (
            <div>
              <Button
                variant="modalWarning"
                view="flex"
                className="h-[40px] mt-[1px]"
                onClick={() => setVisibleModal(!visibleModal)}
              >
                <div
                  className={cx({
                    'mr-[15px]': isRussian,
                    'ml-[15px]': !isRussian,
                  })}
                >
                  <Trash color={delIconColor} size={24} />
                </div>
                {t('questionnaire.delCoBorrower')}
              </Button>
            </div>
          )}
        </div>
        {isMobile && index !== 0 && (
          <Button
            variant="modalWarning"
            view="flex"
            className="h-[40px] flex justify-center mb-[24px]"
            onClick={() => setVisibleModal(!visibleModal)}
          >
            <div
              className={cx({
                'mr-[19px]': isRussian,
                'ml-[19px]': !isRussian,
              })}
            >
              <Trash color={delIconColor} size={24} />
            </div>
            {t('questionnaire.delCoBorrower')}
          </Button>
        )}
        <div className={cx(styles.infoPlate)}>
          <InformationCard
            link={nav('personalDataUser')}
            title={t('questionnaire.personalData')}
            stringTitle={people.name}
            stringData={people.phone}
          />
          <InformationCard
            link={nav('personalDataIncome')}
            title={t('questionnaire.income')}
            stringTitle={people.incomeType}
            stringData={`${people.incomeSum.toLocaleString('en-US')} ₪`}
          />
        </div>
        {people.questionnaireStatus !== 'ended' && (
          <Button
            view="flex"
            className={cx(styles.buttonHeight)}
            to={nav('completeSurvey')}
          >
            <span className="w-full text-center">
              {t('questionnaire.endQuestionnaire')}
            </span>
          </Button>
        )}
      </div>
    )),
  }

  return (
    <div className="w-full">
      <ExitDeleteModal
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
        title={t('questionnaire.modal.title')}
        icon={<Trash size={30} color={primaryIconColor} />}
        buttonText={t('questionnaire.modal.buttonText')}
        onClickFunction={delCoBorrower}
      />
      <QuestionnaireTitle />
      {isMobile && (
        <Button
          variant="secondary"
          view="flex"
          className="h-[40px] mb-[32px] flex justify-center"
        >
          <div
            className={cx({
              'mr-[0.6rem]': isRussian,
              'ml-[0.6rem]': !isRussian,
            })}
          >
            <Plus size={24} />
          </div>
          {t('questionnaire.addCoBorrower')}
        </Button>
      )}
      {peoplesData.length > 1 ? (
        <Tab data={TabData} />
      ) : (
        peoplesData.map((people, index) => (
          <div key={index} className={cx(styles.onePlate)}>
            <div className={cx(styles.infoPlateOne)}>
              <InformationCard
                link={nav('personalDataUser')}
                title={t('questionnaire.personalData')}
                stringTitle={people.name}
                stringData={people.phone}
              />
              <InformationCard
                link={nav('personalDataIncome')}
                title={t('questionnaire.income')}
                stringTitle={people.incomeType}
                stringData={`${people.incomeSum.toLocaleString('en-US')} ₪`}
              />
            </div>
            {people.questionnaireStatus !== 'ended' && (
              <Button
                view="flex"
                className={cx(styles.buttonHeight)}
                to={nav('completeSurvey')}
              >
                <span className="w-full text-center">
                  {t('questionnaire.endQuestionnaire')}
                </span>
              </Button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default TopLayout
