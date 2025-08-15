import classNames from 'classnames/bind'
import Dropzone from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { ArrowSquareOut } from '@assets/icons/ArrowSquareOut'
import { PlayIcon } from '@assets/icons/PlayIcon'
import { UploadSimpleIcon } from '@assets/icons/UploadSimpleIcon'
import BackButton from '@src/components/ui/BackButton/BackButton'
import { Button } from '@src/components/ui/ButtonUI'
import Divider from '@src/components/ui/Divider/Divider'
import FormCaption from '@src/components/ui/FormCaption/FormCaption'
import { NewButton } from '@src/components/ui/NewButton'

import styles from './uploadReport.module.scss'

const cx = classNames.bind(styles)

const UploadReport = () => {
  const { t, i18n } = useTranslation()

  const navigate = useNavigate()

  return (
    <div className={'step1'}>
      <div className={'home step1-container noborder'}>
        <FormCaption
          title={t('upload_report_title')}
          subtitle={t('upload_report_subtitle')}
        />
        <div className={cx('upload-buttons')}>
          <NewButton text={t('video_instruction')} leftSection={<PlayIcon />} />
          <NewButton
            text={t('download_report_here')}
            rightSection={<ArrowSquareOut />}
            onClick={() => window.open('https://www.creditdata.org.il/', '_blank')}
          />
        </div>
        <Divider />
        <Dropzone onDrop={(acceptedFiles) => console.log('Files uploaded:', acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <section className={cx('upload-report-file')}>
              <div
                {...getRootProps()}
                className={cx('upload-report-file__wrapper')}
              >
                <input {...getInputProps()} />
                <UploadSimpleIcon />
                <p className={cx('upload-report-file__text')}>
                  {t('dropzone_upload_report')}
                  <span style={{ color: '#FBE54D' }}>
                    {t('dropzone_comp_upload_report')}
                  </span>
                </p>
              </div>
            </section>
          )}
        </Dropzone>
        <div className={cx('submit-buttons')}>
          <div className={cx('submit-buttons__wrapper')}>
            <BackButton
              title={t('button_back')}
              handleClick={() => navigate('/services/refinance-mortgage/1')}
            />
            <Button onClick={() => navigate('/services/refinance-mortgage/1')}>
              {t('button_next_save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadReport
