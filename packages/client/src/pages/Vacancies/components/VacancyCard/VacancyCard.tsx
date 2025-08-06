import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPinIcon } from '../../../../assets/icons/MapPinIcon'
import { ClockIcon } from '../../../../assets/icons/ClockIcon'
import CurrencyIcon from '../../../../assets/icons/CurrencyIcon/CurrencyIcon'
import styles from './VacancyCard.module.scss'

interface VacancyCardProps {
  id: number
  category: string
  title: string
  location: string
  description: string
  employmentType: string
  salary: string
  categoryColor?: string
}

const VacancyCard: React.FC<VacancyCardProps> = ({
  id,
  category,
  title,
  location,
  description,
  employmentType,
  salary,
  categoryColor = '#FBE54D'
}) => {
  const { t } = useTranslation()

  return (
    <Link to={`/vacancies/${id}`} className={styles.vacancyCardLink}>
      <div className={styles.vacancyCard}>
        <div className={styles.categoryChip} style={{ backgroundColor: categoryColor }}>
          <div className={styles.categoryDot} style={{ backgroundColor: '#FFD700' }} />
          <span className={styles.categoryText}>{category}</span>
        </div>
        
        <h3 className={styles.jobTitle}>{title}</h3>
        
        <div className={styles.jobInfo}>
          <div className={styles.infoItem}>
            <MapPinIcon className={styles.icon} />
            <span className={styles.infoText}>{location}</span>
          </div>
        </div>
        
        <p className={styles.description}>{description}</p>
        
        <div className={styles.jobDetails}>
          <div className={styles.detailItem}>
            <ClockIcon className={styles.icon} />
            <span className={styles.detailText}>{employmentType}</span>
          </div>
          
          <div className={styles.detailItem}>
            <CurrencyIcon className={styles.icon} />
            <span className={styles.detailText}>{salary}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default VacancyCard 