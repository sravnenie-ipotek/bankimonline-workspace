import classNames from 'classnames/bind'

import { CardCheap } from '@assets/icons/Card/CardCheap'
import { NFC } from '@assets/icons/Card/NFC'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './emptyCreditCard.module.scss'

const cx = classNames.bind(styles)

const EmptyCreditCard: React.FC = () => {
  const theme = useTheme()
  const iconColor = theme?.colors?.textTheme.disabled

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  return (
    <div className={cx(styles.cardPlate)}>
      <div className="flex align-center flex-col">
        <div className={cx(styles.topLine)}>
          {isRussian && <p className={cx(styles.cardBank)}>Bank</p>}
          <p></p>
          {!isRussian && <p className={cx(styles.cardBank)}>Bank</p>}
        </div>
        <div className={cx(styles.centerLine)}>
          {isRussian && <CardCheap size={50} color={iconColor} />}
          <NFC size={27} color={iconColor} />
          {!isRussian && <CardCheap size={50} color={iconColor} />}
        </div>
        <div className={cx(styles.centerNameLine)}>
          <div className={cx(styles.topLine)}>
            {isRussian && (
              <p className={cx(styles.cardNumber)}>0000 0000 0000 0000</p>
            )}
            <p></p>
            {!isRussian && (
              <p className={cx(styles.cardNumber)}>0000 0000 0000 0000</p>
            )}
          </div>
          <div className={cx(styles.topLine)}>
            {isRussian && <p className={cx(styles.cardDate)}>MM/YY</p>}
            <p></p>
            {!isRussian && <p className={cx(styles.cardNumber)}>MM/YY</p>}
          </div>
        </div>
        <div className={cx(styles.bottomLine)}>
          {isRussian && <p className={cx(styles.cardBottomLine)}>Name</p>}
          <p className={cx(styles.cardBottomLine)}>Card</p>
          {!isRussian && <p className={cx(styles.cardBottomLine)}>Name</p>}
        </div>
      </div>
    </div>
  )
}

export default EmptyCreditCard
