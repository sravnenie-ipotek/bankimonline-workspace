import classNames from 'classnames/bind'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'
import { ButtonUI } from '@src/components/ui/ButtonUI'

import styles from './lawyersPage.module.scss'

const cx = classNames.bind(styles)

interface DropdownOption {
  value: string
  label: string
}

const LawyersPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  // State for dropdown options
  const [cities, setCities] = useState<DropdownOption[]>([])
  const [regions, setRegions] = useState<DropdownOption[]>([])
  const [professions, setProfessions] = useState<DropdownOption[]>([])
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    email: '',
    city: '',
    desiredRegion: '',
    employmentType: '',
    monthlyIncome: '',
    workExperience: '',
    clientLitigation: '',
    debtLitigation: '',
    comments: '',
    termsAccepted: false
  })

  // Fetch dropdown data from APIs
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true)
        
        // Fetch cities
        const citiesResponse = await fetch(`/api/get-cities?lang=${i18n.language}`)
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json()
          if (citiesData.status === 'success') {
            const formattedCities = citiesData.data.map((city: any) => ({
              value: city.value || city.key,
              label: city.name
            }))
            setCities(formattedCities)
          }
        }

        // Fetch regions
        const regionsResponse = await fetch(`/api/get-regions?lang=${i18n.language}`)
        if (regionsResponse.ok) {
          const regionsData = await regionsResponse.json()
          if (regionsData.status === 'success') {
            const formattedRegions = regionsData.data.map((region: any) => ({
              value: region.key,
              label: region.name
            }))
            setRegions(formattedRegions)
          }
        }

        // Fetch professions
        const professionsResponse = await fetch(`/api/get-professions?lang=${i18n.language}`)
        if (professionsResponse.ok) {
          const professionsData = await professionsResponse.json()
          if (professionsData.status === 'success') {
            const formattedProfessions = professionsData.data.map((profession: any) => ({
              value: profession.key,
              label: profession.name
            }))
            setProfessions(formattedProfessions)
          }
        }
        
      } catch (error) {
        console.error('Error fetching dropdown data:', error)
        // Fallback data if API fails
        setCities([
          { value: 'tel_aviv', label: 'תל אביב' },
          { value: 'jerusalem', label: 'ירושלים' },
          { value: 'haifa', label: 'חיפה' }
        ])
        setRegions([
          { value: 'center', label: 'מחוז המרכז' },
          { value: 'tel_aviv', label: 'מחוז תל אביב' },
          { value: 'jerusalem', label: 'מחוז ירושלים' }
        ])
        setProfessions([
          { value: 'lawyer', label: 'עורך דין' },
          { value: 'legal_advisor', label: 'יועץ משפטי' },
          { value: 'notary', label: 'נוטריון' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [i18n.language])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.contactName || !formData.phone || !formData.email) {
      alert('אנא מלאו את כל השדות הנדרשים')
      return
    }

    if (!formData.termsAccepted) {
      alert('יש לאשר את תנאי השימוש')
      return
    }

    try {
      // Submit form logic here
      console.log('Form submitted:', formData)
      alert('הטופס נשלח בהצלחה! נחזור אליכם בקרוב.')
      
      // Reset form
      setFormData({
        contactName: '',
        phone: '',
        email: '',
        city: '',
        desiredRegion: '',
        employmentType: '',
        monthlyIncome: '',
        workExperience: '',
        clientLitigation: '',
        debtLitigation: '',
        comments: '',
        termsAccepted: false
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('שגיאה בשליחת הטופס. אנא נסו שוב.')
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className={cx('lawyers-form', { rtl: i18n.language === 'he' })}>
        <Container>
          <div className={cx('form-container')}>
            <div className={cx('form-header')}>
              <div className={cx('logo')}>
                <span className={cx('logo-text')}>TechRealt</span>
              </div>
            </div>
            <div className={cx('form-content')}>
              <div className={cx('loading-state')}>טוען נתונים...</div>
            </div>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className={cx('lawyers-form', { rtl: i18n.language === 'he' })}>
      <Container>
        <div className={cx('form-container')}>
          <div className={cx('form-header')}>
            <div className={cx('logo')}>
              <span className={cx('logo-text')}>TechRealt</span>
            </div>
          </div>
          
          <div className={cx('form-content')}>
            <div className={cx('form-title')}>
              <h1>טופס הרשמה לעורכי דין ויועצים משפטיים</h1>
              <p className={cx('form-subtitle')}>הצטרפו לרשת המובילה של מתווכי נדל"ן ומשפטנים מקצועיים</p>
            </div>

            <form onSubmit={handleSubmit} className={cx('lawyer-form')}>
              <div className={cx('form-section')}>
                <h2 className={cx('section-title')}>פרטים אישיים</h2>
                
                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>שם איש הקשר המוסמך</label>
                    <input
                      type="text"
                      className={cx('form-input')}
                      placeholder="הזינו שם מלא"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      required
                    />
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>טלפון</label>
                    <input
                      type="tel"
                      className={cx('form-input')}
                      placeholder="050-123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>דוא"ל</label>
                    <input
                      type="email"
                      className={cx('form-input')}
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>עיר מגורים</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    >
                      <option value="">בחרו עיר</option>
                      {cities.map(city => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>אזור פעילות מועדף לשירותים משפטיים</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.desiredRegion}
                      onChange={(e) => handleInputChange('desiredRegion', e.target.value)}
                    >
                      <option value="">בחרו אזור</option>
                      {regions.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={cx('form-section')}>
                <h2 className={cx('section-title')}>פרטים מקצועיים</h2>
                
                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>סטטוס מקצועי</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.employmentType}
                      onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    >
                      <option value="">בחרו סטטוס</option>
                      {professions.map(profession => (
                        <option key={profession.value} value={profession.value}>
                          {profession.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>הכנסה חודשית ממוצעת</label>
                    <input
                      type="text"
                      className={cx('form-input')}
                      placeholder="25,000 ₪"
                      value={formData.monthlyIncome}
                      onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    />
                  </div>
                </div>

                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>שנות ניסיון בתחום המשפטי</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.workExperience}
                      onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    >
                      <option value="">בחרו מספר שנים</option>
                      <option value="0-2">0-2 שנים</option>
                      <option value="3-5">3-5 שנים</option>
                      <option value="6-10">6-10 שנים</option>
                      <option value="11-15">11-15 שנים</option>
                      <option value="16+">16+ שנים</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={cx('form-section')}>
                <h2 className={cx('section-title')}>מידע נוסף</h2>
                
                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>האם יש לכם ניסיון בייצוג לקוחות בהליכים משפטיים?</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.clientLitigation}
                      onChange={(e) => handleInputChange('clientLitigation', e.target.value)}
                    >
                      <option value="">בחרו תשובה</option>
                      <option value="yes">כן, ניסיון רב</option>
                      <option value="some">כן, ניסיון מוגבל</option>
                      <option value="no">לא</option>
                    </select>
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>האם יש לכם ניסיון בהליכי גביית חובות?</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.debtLitigation}
                      onChange={(e) => handleInputChange('debtLitigation', e.target.value)}
                    >
                      <option value="">בחרו תשובה</option>
                      <option value="yes">כן, ניסיון רב</option>
                      <option value="some">כן, ניסיון מוגבל</option>
                      <option value="no">לא</option>
                    </select>
                  </div>
                </div>

                <div className={cx('form-group')}>
                  <label className={cx('form-label')}>הערות נוספות</label>
                  <textarea
                    className={cx('form-textarea')}
                    placeholder="ספרו לנו עוד על הרקע המקצועי שלכם ועל התחומים המעניינים אתכם..."
                    rows={4}
                    value={formData.comments}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                  />
                </div>
              </div>

              <div className={cx('form-section')}>
                <div className={cx('terms-section')}>
                  <label className={cx('checkbox-label')}>
                    <input
                      type="checkbox"
                      className={cx('checkbox')}
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      required
                    />
                    <span className={cx('checkbox-text')}>
                      אני מסכים/ה לתנאי השימוש ולמדיניות הפרטיות ומאשר/ת קבלת עדכונים מטעם TechRealt
                    </span>
                  </label>
                </div>

                <div className={cx('form-actions')}>
                  <ButtonUI
                    variant="secondary"
                    size="full"
                    onClick={handleBack}
                    type="button"
                  >
                    חזרה
                  </ButtonUI>
                  <ButtonUI
                    variant="primary"
                    size="full"
                    type="submit"
                  >
                    שליחת הטופס
                  </ButtonUI>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default LawyersPage 