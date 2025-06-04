import classNames from 'classnames/bind'
import { useState } from 'react'

import { DocumentStatusLabel } from '@src/components/ui/Labels/DocumentStatusLabel'
import { LiList } from '@src/components/ui/Lists/LiList'
import { UlList } from '@src/components/ui/Lists/UlList'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './documentationCard.module.scss'

const cx = classNames.bind(styles)

const uploadDocument = { name: 'passport.pdf', path: '', size: '866 KB' } // макет данных загруженного документа

const DocumentationCard = () => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)

  const isRussian = currentFont === 'font-ru'

  const [isUploadDocument] = useState(false)

  return (
    <div className={cx(styles.documentationCardPlate)}>
      <p className={cx(styles.documentationCardPlateTitle)}>
        {isRussian ? 'Паспорт лицевая сторона' : 'הדרכון הקדמי'}
      </p>
      {!isUploadDocument && (
        <UlList additionalStyles={cx(styles.documentationCardList)}>
          <LiList additionalStyles={cx(styles.documentationCardListLi)}>
            {isRussian
              ? 'В формате PDF, JPEG, JPG, HEIF'
              : 'בפורמט PDF, JPEG, JPG, HEIF'}
          </LiList>
          <LiList additionalStyles={cx(styles.documentationCardListLi)}>
            {isRussian
              ? 'Убедитесь, что изображение четкое'
              : 'ודא שהתמונה ברורה'}
          </LiList>
        </UlList>
      )}
      {isUploadDocument && <DocumentStatusLabel status="checked" />}
      {isUploadDocument && (
        <div className={cx(styles.documentationCardUploadDocumentPlate)}>
          <div className={cx(styles.documentationCardUploadDocumentImgCard)}>
            <img
              alt={uploadDocument.name}
              className={cx(styles.documentationCardUploadDocumentImg)}
              src={uploadDocument.path}
            />
          </div>
          <p className={cx(styles.documentationCardUploadDocumentImgName)}>
            {uploadDocument.name}
          </p>
          <p className={cx(styles.documentationCardUploadDocumentImgSize)}>
            {uploadDocument.size}
          </p>
        </div>
      )}
    </div>
  )
}

export default DocumentationCard
