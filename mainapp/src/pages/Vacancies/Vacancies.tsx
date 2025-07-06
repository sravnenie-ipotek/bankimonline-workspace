import React, { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Container from '../../components/ui/Container/Container'
import CategoryFilter from './components/CategoryFilter/CategoryFilter'
import VacancyCard from './components/VacancyCard/VacancyCard'
import styles from './Vacancies.module.scss'

interface Vacancy {
  id: number
  title: string
  category: string
  subcategory?: string
  location: string
  description: string
  employment_type: string
  salary_min: number
  salary_max: number
  salary_currency: string
  is_featured?: boolean
  posted_date: string
  closing_date?: string
}

const Vacancies = () => {
  const { t, i18n } = useTranslation()
  const [activeCategory, setActiveCategory] = useState('all')
  const [vacancies, setVacancies] = useState<Vacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vacancies from API (using Vite proxy configuration)
  const fetchVacancies = async (category: string = 'all') => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        category: category,
        lang: i18n.language || 'en',
        active_only: 'true'
      })
      
      const response = await fetch(`/api/vacancies?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        setVacancies(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch vacancies')
      }
    } catch (err) {
      console.error('Error fetching vacancies:', err)
      setError(err instanceof Error ? err.message : 'Failed to load vacancies')
      // Fallback to empty array
      setVacancies([])
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchVacancies(activeCategory)
  }, [i18n.language]) // Refetch when language changes

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    fetchVacancies(category)
  }

  // Format salary display
  const formatSalary = (min: number, max: number, currency: string) => {
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat().format(num)
    }
    
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`
    } else if (min) {
      return `${t('vacancy_salary_from')} ${formatNumber(min)} ${currency}`
    }
    return ''
  }

  // Filter vacancies (client-side filtering for better UX)
  const filteredVacancies = useMemo(() => {
    if (activeCategory === 'all') {
      return vacancies
    }
    return vacancies.filter(vacancy => vacancy.category === activeCategory)
  }, [vacancies, activeCategory])

  // Map employment type for display
  const getEmploymentTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'full_time': t('vacancy_employment_fulltime'),
      'part_time': t('vacancy_employment_parttime', 'Part Time'),
      'contract': t('vacancy_employment_contract', 'Contract'),
      'temporary': t('vacancy_employment_temporary', 'Temporary')
    }
    return typeMap[type] || type
  }

  return (
    <div className={styles.vacanciesPage}>
      <Container>
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>{t('vacancies_title')}</h1>
            <p className={styles.subtitle}>{t('vacancies_subtitle')}</p>
          </div>

          {/* Category Filter */}
          <CategoryFilter 
            onCategoryChange={handleCategoryChange}
            activeCategory={activeCategory}
          />

          {/* Loading State */}
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('loading', 'Loading...')}</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.error}>
              <p>{t('error_loading_vacancies', 'Failed to load vacancies. Please try again later.')}</p>
              <button 
                className={styles.retryButton}
                onClick={() => fetchVacancies(activeCategory)}
              >
                {t('retry', 'Retry')}
              </button>
            </div>
          )}

          {/* Vacancy Cards */}
          {!loading && !error && (
            <div className={styles.vacancyGrid}>
              {filteredVacancies.length > 0 ? (
                filteredVacancies.map((vacancy) => (
                  <VacancyCard
                    key={vacancy.id}
                    id={vacancy.id}
                    category={t(`vacancies_category_${vacancy.category}`, vacancy.category)}
                    title={vacancy.title}
                    location={vacancy.location}
                    description={vacancy.description}
                    employmentType={getEmploymentTypeText(vacancy.employment_type)}
                    salary={formatSalary(vacancy.salary_min, vacancy.salary_max, vacancy.salary_currency)}
                    categoryColor={getCategoryColor(vacancy.category)}
                  />
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>{t('vacancies_no_results')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

// Helper function to get category colors
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'development': '#FBE54D',
    'design': '#4DABF7',
    'management': '#69DB7C',
    'marketing': '#FFB366',
    'finance': '#A78BFA',
    'customer_service': '#FF8CC8'
  }
  return colorMap[category] || '#FBE54D'
}

export default Vacancies
