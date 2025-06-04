import classNames from 'classnames/bind'

import { AmericanExpress } from '@assets/icons'
import { Diners } from '@assets/icons'
import { MasterCard } from '@assets/icons'
import { Visa } from '@assets/icons'
import { CardCheap } from '@assets/icons/Card/CardCheap'
import { NFC } from '@assets/icons/Card/NFC'
import { useAppSelector } from '@src/hooks/store'
import { RootState } from '@src/store'

import styles from './viewCreditCard.module.scss'

const cx = classNames.bind(styles)

interface ViewCreditCardProps {
  cardNumber: string // номер карты
  cardName: string // имя владельца карты
  cardType: string // тип карты?
  cardPaymentSystem: 'Visa' | 'MasterCard' | 'American Express' | 'Diners' // платёжная система карты
}

const ViewCreditCard: React.FC<ViewCreditCardProps> = ({
  cardNumber,
  cardName,
  cardType,
  cardPaymentSystem,
}: ViewCreditCardProps) => {
  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  return (
    <div className={cx(styles.cardPlate)}>
      <div className="flex align-center flex-col">
        <div className={cx(styles.topLine)}>
          {isRussian && <CardCheap />}
          {cardPaymentSystem === 'Visa' && <Visa />}
          {cardPaymentSystem === 'MasterCard' && <MasterCard />}
          {cardPaymentSystem === 'American Express' && <AmericanExpress />}
          {cardPaymentSystem === 'Diners' && <Diners />}
          {!isRussian && <CardCheap />}
        </div>
        <div className={cx(styles.centerLine)}>
          {isRussian && <p className={cx(styles.cardNumber)}>{cardNumber}</p>}
          <NFC />
          {!isRussian && <p className={cx(styles.cardNumber)}>{cardNumber}</p>}
        </div>
        <div className={cx(styles.bottomLine)}>
          {isRussian && <p className={cx(styles.cardName)}>{cardName}</p>}
          <p className={cx(styles.cardType)}>{cardType}</p>
          {!isRussian && <p className={cx(styles.cardName)}>{cardName}</p>}
        </div>
      </div>
    </div>
  )
}

export default ViewCreditCard
