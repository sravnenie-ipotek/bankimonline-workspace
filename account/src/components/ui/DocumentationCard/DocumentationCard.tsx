import classNames from 'classnames/bind'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { QuestionCircle } from '@assets/icons'
import { Eye } from '@assets/icons/Eye'
import { Headphones } from '@assets/icons/Headphones'
import { Logout } from '@assets/icons/Logout'
import { NoImage } from '@assets/icons/NoImage'
import { PencilSimple } from '@assets/icons/PencilSimple'
import { Trash } from '@assets/icons/Trash'
import { ViewDocumentModal } from '@pages/Documents/ui/ViewDocumentModal'
import { Button } from '@src/components/ui/Button'
import { DocumentStatusLabel } from '@src/components/ui/Labels/DocumentStatusLabel'
import { LiList } from '@src/components/ui/Lists/LiList'
import { UlList } from '@src/components/ui/Lists/UlList'
import { useAppSelector } from '@src/hooks/store'
import useRoute from '@src/hooks/useRoute'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import { ExitDeleteModal } from '../ExitDeleteModal'
import { UploadDocumentModal } from '../UploadDocumentModal'
import styles from './documentationCard.module.scss'

const cx = classNames.bind(styles)

interface DocumentationCardProps {
  documentType: string
  isUpload: boolean
  documentName: string
  documentPath: string
  documentSize: string
  documentStatus: 'accepted' | 'notAccepted' | 'checked'
}

const DocumentationCard: React.FC<DocumentationCardProps> = ({
  documentType, // заголовок
  isUpload, // загружен или нет
  documentName, // навзание файла
  documentPath, // путь для просмотра документа
  documentSize, // размер файла
  documentStatus, // размер файла
}: DocumentationCardProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const [visibleDelModal, setVisibleDelModal] = useState(false)
  const [visibleUploadModal, setVisibleUploadModal] = useState(false)
  const [visibleViewDocumentModal, setVisibleViewDocumentModal] =
    useState(false)

  const theme = useTheme()
  const iconColor = theme?.colors?.base.white
  const delIconColor = theme?.colors?.error.error100

  const { t } = useTranslation()

  const [isPdf, setIsPdf] = useState(false)

  useEffect(() => {
    // тест на pdf
    const cateName = documentName.slice(-4)
    if (cateName.toLocaleLowerCase().endsWith('.pdf')) setIsPdf(true)
  }, [documentName])

  //ошибки при загрузке изображения
  const [imgError, setImgError] = useState(false)

  const delDocument = () => {
    console.log('Выполнение запроса на удаление документа')
  }

  const { nav } = useRoute()

  const visibleViewDocument = () => {
    isPdf
      ? window.open(documentPath, '_blank')?.focus()
      : setVisibleViewDocumentModal(true)
  }

  return (
    <>
      <ExitDeleteModal
        visibleModal={visibleDelModal}
        setVisibleModal={setVisibleDelModal}
        title={t('documentationCard.modals.delDocument.title')}
        icon={<Trash size={30} color={iconColor} />}
        buttonText={t('documentationCard.modals.delDocument.buttonText')}
        onClickFunction={delDocument}
      />
      <UploadDocumentModal
        visibleModal={visibleUploadModal}
        setVisibleModal={setVisibleUploadModal}
      />
      <ViewDocumentModal
        visibleModal={visibleViewDocumentModal}
        setVisibleModal={setVisibleViewDocumentModal}
        alt={documentType}
        path={documentPath}
        name={documentName}
      />
      <div className={cx('documentationCardPlate')}>
        <p className={cx(styles.documentationCardPlateTitle)}>{documentType}</p>
        {/* До загрузки документа */}
        {!isUpload && (
          <UlList additionalStyles={cx('documentationCardList')}>
            <LiList additionalStyles={cx('listLi')}>
              {t('documentationCard.list.li1')}
            </LiList>
            <LiList additionalStyles={cx('listLi')}>
              {t('documentationCard.list.li2')}
            </LiList>
          </UlList>
        )}
        {!isUpload && (
          <>
            <div className={cx('documentNonUploadButtonLine')}>
              <Button
                variant="secondary"
                view="flex"
                className="h-[40px]"
                onClick={() => setVisibleUploadModal(!visibleUploadModal)}
              >
                <div
                  className={cx({
                    'mr-[0.6rem]': isRussian,
                    'ml-[0.6rem]': !isRussian,
                  })}
                >
                  <div className="-rotate-90">
                    <Logout size={24} color={iconColor} />
                  </div>
                </div>
                <span className={cx('documentButtonText')}>
                  {t('documentationCard.uploadDocument')}
                </span>
              </Button>
              <Button
                variant="secondary"
                view="smallSquare"
                className={
                  isRussian ? styles.buttonMarginLeft : styles.buttonMarginRight
                }
                to={nav('support')}
              >
                <Headphones />
              </Button>
            </div>
            <Button variant="secondary" view="flex" className="h-[40px]">
              <div
                className={cx({
                  'mr-[0.6rem]': isRussian,
                  'ml-[0.6rem]': !isRussian,
                })}
              >
                <QuestionCircle color={iconColor} />
              </div>
              <span className={cx('documentButtonText')}>
                {t('documentationCard.sampleDocument')}
              </span>
            </Button>
          </>
        )}
        {/* После загрузки документа */}
        {isUpload && <DocumentStatusLabel status={documentStatus} />}
        {isUpload && (
          <div className={cx('documentationCardUploadDocumentPlate')}>
            <div className={cx('documentImgCard')}>
              {isPdf ? (
                <p>PDF</p>
              ) : documentPath && !imgError ? (
                <img
                  alt={documentName}
                  className={cx('documentImg')}
                  src={documentPath}
                  onError={() => setImgError(true)}
                />
              ) : (
                <NoImage />
              )}
            </div>
            <p className={cx('documentImgName')}>{documentName}</p>
            <p className={cx('documentImgSize')}>{documentSize}</p>
          </div>
        )}
        {isUpload && (
          <>
            <div className={cx('documentUploadButtonLine')}>
              <div className={cx('buttonLineInside')}>
                <Button
                  variant="secondary"
                  view="smallSquare"
                  className="justify-center"
                  onClick={visibleViewDocument}
                >
                  <Eye color={iconColor} />
                </Button>
                <Button
                  variant="secondary"
                  view="smallSquare"
                  className={
                    isRussian
                      ? styles.buttonMarginLeft
                      : styles.buttonMarginRight
                  }
                  onClick={() => setVisibleUploadModal(true)}
                >
                  <PencilSimple size={24} color={iconColor} />
                </Button>
                <Button
                  variant="secondary"
                  view="smallSquare"
                  className={
                    isRussian
                      ? styles.buttonMarginLeft
                      : styles.buttonMarginRight
                  }
                  to={nav('support')}
                >
                  <Headphones color={iconColor} />
                </Button>
              </div>
              <Button
                variant="secondary"
                view="smallSquare"
                className={
                  isRussian ? styles.buttonMarginLeft : styles.buttonMarginRight
                }
                onClick={() => setVisibleDelModal(!visibleDelModal)}
              >
                <Trash size={24} color={delIconColor} />
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default DocumentationCard
