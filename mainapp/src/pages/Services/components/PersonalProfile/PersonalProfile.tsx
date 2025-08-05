import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useContentApi } from '@src/hooks/useContentApi'

import { PensilSimple } from '@assets/icons/PencilSimple'
import { Column } from '@components/ui/Column'

import { formatPhoneNumber } from '../../utils/formatPhoneNumber'
import styles from './personalProfile.module.scss'

const cx = classNames.bind(styles)

type TypeProps = {
  name?: string
  phone?: string
}
const PersonalProfile: React.FC<TypeProps> = ({ name, phone }: TypeProps) => {
  const { t, i18n } = useTranslation()
  const { getContent } = useContentApi('mortgage_step4')
  const navigate = useNavigate()
  return (
    <Column>
      <div className={cx('profile')}>
        <div className={cx('profile-title')}>
          <p className={cx('profile-title__text')}>
            {getContent('calculate_mortgage_profile_title', 'calculate_mortgage_profile_title')}
          </p>
          <PensilSimple
            onClick={() => navigate('/services/calculate-mortgage/2')}
            className={cx('profile-title__icon')}
          />
        </div>
        <div className={cx('profile-data')}>
          <div className={cx('profile-data__name')}>{name}</div>
          <div className={cx('profile-data__phone')}>
            {phone && formatPhoneNumber(phone, i18n.language)}
          </div>
        </div>
      </div>
    </Column>
  )
}

export default PersonalProfile
