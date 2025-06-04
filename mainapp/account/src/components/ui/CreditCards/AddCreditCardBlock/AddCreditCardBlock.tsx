import classNames from 'classnames/bind'
import { useTranslation } from 'react-i18next'

import { Plus } from '@assets/icons/Plus'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './addCreditCard.module.scss'

const cx = classNames.bind(styles)

const AddCreditCardBlock = ({ ...props }) => {
  const theme = useTheme()
  const iconColor = theme?.colors?.accent.primary

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const { t } = useTranslation()

  return (
    <div className={cx(styles.cardPlate)} {...props}>
      <div className="flex align-center">
        {isRussian && <Plus color={iconColor} />}
        <p className={cx(styles.cardCenterContent)}>
          {t('cards.addCard.title')}
        </p>
        {!isRussian && <Plus color={iconColor} />}
      </div>
    </div>
  )
}

export default AddCreditCardBlock
