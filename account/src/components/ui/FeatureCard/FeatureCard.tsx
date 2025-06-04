import classNames from 'classnames/bind'
import { Link } from 'react-router-dom'

import { Caret } from '@assets/icons/Caret'
import { useAppSelector } from '@src/hooks/store'
import useTheme from '@src/hooks/useTheme'
import { RootState } from '@src/store'

import styles from './featureCard.module.scss'

const cx = classNames.bind(styles)

interface FeatureCardProps {
  title: string // заголовок услуги
  img: string //ссылка на изображение
  link: string //путь ссылки
  variant: 'big' | 'small' // вариант карты
  className?: string // дополнительные CSS-классы
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  img,
  link,
  variant,
  className,
}: FeatureCardProps) => {
  const theme = useTheme()
  const iconColor = theme?.colors?.textTheme.primary

  const { currentFont } = useAppSelector((state: RootState) => state.language)
  const isRussian = currentFont === 'font-ru'

  const cardClasses = {
    [styles.featureCardPlate]: true, // Добавление базового css-класса кнопки
    [variant]: true, // Добавление css-класса, соответствующего выбранному variant
  }

  return (
    <Link to={link} className={cx(cardClasses, className)}>
      <div className={cx(styles.cardCaret, !isRussian && 'rotate-180')}>
        <Caret color={iconColor} size={32} />
      </div>
      <p
        className={cx(
          styles.cardTitle,
          isRussian ? styles.cardTitleL : styles.cardTitleR
        )}
      >
        {title}
      </p>
      <div className={styles.cardimgPlate}>
        <img src={img} className={styles.cardImgForPlate} />
      </div>
      <img src={img} className={styles.cardImgMobile} />
    </Link>
  )
}

export default FeatureCard
