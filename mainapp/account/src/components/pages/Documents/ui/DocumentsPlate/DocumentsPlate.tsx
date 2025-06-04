import classNames from 'classnames/bind'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Caret } from '@assets/icons'
import { Services } from '@assets/icons/Services'
import { Table } from '@assets/icons/Table'
import { Document } from '@pages/Documents/types'
import { Button } from '@src/components/ui/Button'
import { DocumentationCard } from '@src/components/ui/DocumentationCard'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './documentsPlate.module.scss'

const cx = classNames.bind(styles)

interface DocumentsPlateProps {
  documents: Document[]
  status: string
}

const DocumentsPlate: React.FC<DocumentsPlateProps> = ({
  documents,
  status,
}) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const theme = useTheme()

  const primaryIconColor = theme?.colors?.accent.primary

  const { t } = useTranslation()

  return (
    <>
      {status !== 'completeSurvey' ? (
        <div className={cx(styles.buttonQue)}>
          <Button
            variant="secondary"
            className="h-[40px]"
            view="flex"
            icon={<Caret color="white" />}
          >
            <Table color={primaryIconColor} />
            <p
              className={cx(
                isRussian ? 'ml-[6px] mr-[21px]' : 'mr-[6px] ml-[21px]'
              )}
            >
              {t('documents.questionnaire')}
            </p>
          </Button>
        </div>
      ) : (
        <div className={cx(styles.buttonSend)}>
          <Button
            className="h-[40px]"
            view="flex"
            icon={<Caret color="black" />}
          >
            <Services color={'black'} />
            <p
              className={cx(
                isRussian ? 'ml-[6px] mr-[21px]' : 'mr-[6px] ml-[21px]'
              )}
            >
              {t('documents.sendTOBank')}
            </p>
          </Button>
        </div>
      )}
      <div className={cx(styles.infoPlate)}>
        {documents.map((personDocument, index) => (
          <DocumentationCard
            key={index}
            documentType={personDocument.documentType}
            isUpload={personDocument.isUpload}
            documentName={personDocument.documentName}
            documentPath={personDocument.documentPath}
            documentSize={personDocument.documentSize}
            documentStatus={personDocument.documentStatus}
          />
        ))}
      </div>
    </>
  )
}

export default DocumentsPlate
