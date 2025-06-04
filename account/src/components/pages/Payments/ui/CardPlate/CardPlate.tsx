import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { DotsMenu } from '@assets/icons/DotsMenu'
import { Trash } from '@assets/icons/Trash'
import { Checkbox } from '@src/components/ui/Checkbox'
import { ExitDeleteModal } from '@src/components/ui/ExitDeleteModal'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './cardPlate.module.scss'

const cx = classNames.bind(styles)

interface CardPlateProps {
  isSelect: boolean
  name: string
}

const CardPlate: React.FC<CardPlateProps> = ({ isSelect, name }) => {
  const theme = useTheme()
  const iconColor = theme?.colors?.textTheme.primary
  const redIconColor = theme?.colors?.error.error100

  const [visibleDeleteCard, setVisibleDeleteCard] = useState(false)

  const { t } = useTranslation()

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const [visibleModal, setVisibleModal] = useState(false)

  const [checked, setChecked] = useState(isSelect)

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked)
  }

  const delCard = () => {
    console.log('Удаление карты')
  }

  return (
    <>
      <ExitDeleteModal
        visibleModal={visibleModal}
        setVisibleModal={setVisibleModal}
        title={t('payments.card.modalTitle')}
        icon={<Trash size={30} color={iconColor} />}
        buttonText={t('payments.card.modalButton')}
        description={t('payments.card.modalDescription')}
        onClickFunction={delCard}
      />
      <div className={cx(styles.underCardPlate)}>
        <Checkbox
          checked={checked}
          onChange={handleCheckboxChange}
          name={name}
        />
        <p
          className={cx(
            styles.underText,
            isRussian ? styles.textRu : styles.textHe
          )}
        >
          {t('payments.card.chouse')}
        </p>
        <div
          className="cursor-pointer"
          onClick={() => setVisibleDeleteCard(!visibleDeleteCard)}
        >
          <DotsMenu />
        </div>
        {visibleDeleteCard && (
          <div
            className={cx(styles.deleteBack)}
            onClick={() => setVisibleModal(!visibleModal)}
          >
            <Trash color={redIconColor} size={20} />
            <p className={cx(styles.underText, isRussian ? 'ml-4' : 'mr-4')}>
              {t('payments.card.del')}
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default CardPlate
