import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './CategoryFilter.module.scss'

interface Category {
  key: string
  label: string
}

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void
  activeCategory: string
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onCategoryChange, activeCategory }) => {
  const { t } = useTranslation()

  // Simplified category structure
  const mainCategories: Category[] = [
    { key: 'all', label: t('vacancies_category_all', 'Все') },
    { key: 'development', label: t('vacancies_category_development', 'Разработка') },
    { key: 'design', label: t('vacancies_category_design', 'Дизайн') },
    { key: 'management', label: t('vacancies_category_management', 'Менеджмент') },
    { key: 'marketing', label: t('vacancies_category_marketing', 'Маркетинг') },
    { key: 'finance', label: t('vacancies_category_finance', 'Финансы') },
    { key: 'customer_service', label: t('vacancies_category_customer_service', 'Работа с клиентами') }
  ]

  const handleCategoryClick = (categoryKey: string) => {
    onCategoryChange(categoryKey)
  }

  return (
    <div className={styles.categoryFilter}>
      <div className={styles.filterRow}>
        {mainCategories.map((category) => (
          <button
            key={category.key}
            className={`${styles.filterButton} ${
              activeCategory === category.key ? styles.active : ''
            }`}
            onClick={() => handleCategoryClick(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter 