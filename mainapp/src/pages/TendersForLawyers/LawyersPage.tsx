import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'

import styles from './lawyersPage.module.scss'

const cx = classNames.bind(styles)

const LawyersPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleBack = () => {
    navigate(-1)
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
            <h1 className={cx('form-title')}>מלאו טופס מועמדות</h1>

            <form onSubmit={handleSubmit} className={cx('application-form')}>
              {/* Personal Information Section */}
              <div className={cx('form-section')}>
                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>שם איש הקשר המוסמך</label>
                    <input
                      type="text"
                      className={cx('form-input')}
                      placeholder="עו״ד אברהם כהן"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                    />
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>טלפון</label>
                    <div className={cx('phone-input')}>
                      <select className={cx('country-code')}>
                        <option value="+972">🇮🇱</option>
                      </select>
                      <input
                        type="tel"
                        className={cx('form-input')}
                        placeholder="+972-4-8536396"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>דואר אלקטרוני</label>
                    <input
                      type="email"
                      className={cx('form-input')}
                      placeholder="הזינו כתובת מייל"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className={cx('form-row')}>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>עיר מגורים</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    >
                      <option value="">בחרו עיר</option>
                      <option value="tel-aviv">תל אביב</option>
                      <option value="jerusalem">ירושלים</option>
                      <option value="haifa">חיפה</option>
                      <option value="beer-sheva">באר שבע</option>
                      <option value="other">אחר</option>
                    </select>
                  </div>
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>אזור פעילות מועדף לשירותים משפטיים</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.desiredRegion}
                      onChange={(e) => handleInputChange('desiredRegion', e.target.value)}
                    >
                      <option value="">בחרו אזור</option>
                      <option value="center">מרכז הארץ</option>
                      <option value="north">צפון הארץ</option>
                      <option value="south">דרום הארץ</option>
                      <option value="jerusalem-area">אזור ירושלים</option>
                      <option value="nationwide">כלל הארץ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
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
                      <option value="partner">שותף במשרד עורכי דין</option>
                      <option value="senior-associate">עורך דין בכיר</option>
                      <option value="independent">עורך דין עצמאי</option>
                      <option value="in-house">יועץ משפטי בחברה</option>
                      <option value="other">אחר</option>
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
                  <div className={cx('form-group')}>
                    <label className={cx('form-label')}>וותק מקצועי</label>
                    <select 
                      className={cx('form-select')}
                      value={formData.workExperience}
                      onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    >
                      <option value="">בחרו וותק</option>
                      <option value="1-3">1-3 שנים</option>
                      <option value="3-5">3-5 שנים</option>
                      <option value="5-10">5-10 שנים</option>
                      <option value="10+">מעל 10 שנים</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className={cx('form-section')}>
                <h2 className={cx('section-title')}>מידע נוסף</h2>
                
                <div className={cx('form-row')}>
                  <div className={cx('form-group', 'radio-group')}>
                    <label className={cx('form-label')}>האם היו תביעות משפטיות מצד לקוחות?</label>
                    <div className={cx('radio-options')}>
                      <label className={cx('radio-option')}>
                        <input 
                          type="radio" 
                          name="clientLitigation" 
                          value="yes"
                          checked={formData.clientLitigation === 'yes'}
                          onChange={(e) => handleInputChange('clientLitigation', e.target.value)}
                        />
                        <span>כן</span>
                      </label>
                      <label className={cx('radio-option')}>
                        <input 
                          type="radio" 
                          name="clientLitigation" 
                          value="no"
                          checked={formData.clientLitigation === 'no'}
                          onChange={(e) => handleInputChange('clientLitigation', e.target.value)}
                        />
                        <span>לא</span>
                      </label>
                    </div>
                  </div>
                  <div className={cx('form-group', 'radio-group')}>
                    <label className={cx('form-label')}>האם היו הליכים משפטיים בנושא חובות?</label>
                    <div className={cx('radio-options')}>
                      <label className={cx('radio-option')}>
                        <input 
                          type="radio" 
                          name="debtLitigation" 
                          value="yes"
                          checked={formData.debtLitigation === 'yes'}
                          onChange={(e) => handleInputChange('debtLitigation', e.target.value)}
                        />
                        <span>כן</span>
                      </label>
                      <label className={cx('radio-option')}>
                        <input 
                          type="radio" 
                          name="debtLitigation" 
                          value="no"
                          checked={formData.debtLitigation === 'no'}
                          onChange={(e) => handleInputChange('debtLitigation', e.target.value)}
                        />
                        <span>לא</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={cx('form-group', 'full-width')}>
                  <label className={cx('form-label')}>הערות לבקשה</label>
                  <textarea
                    className={cx('form-textarea')}
                    placeholder="אנא פרטו על הניסיון המקצועי שלכם, התמחויות, וציפיות מהשותפות איתנו"
                    rows={5}
                    value={formData.comments}
                    onChange={(e) => handleInputChange('comments', e.target.value)}
                  />
                </div>
              </div>

              {/* Terms and Submit */}
              <div className={cx('form-section')}>
                <label className={cx('checkbox-label')}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  />
                  <span className={cx('checkbox-text')}>
                    אני מאשר את <a href="/terms" className={cx('terms-link')}>התנאים וההגבלות</a> ונותן הסכמתי לעיבוד המידע האישי שלי בהתאם לתנאים שנקבעו ב<a href="/privacy-policy" className={cx('terms-link')}>מדיניות הפרטיות</a>.
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className={cx('form-actions')}>
                <button 
                  type="button" 
                  className={cx('btn-secondary')}
                  onClick={handleBack}
                >
                  חזרה
                </button>
                <button 
                  type="submit" 
                  className={cx('btn-primary')}
                  disabled={!formData.termsAccepted}
                >
                  שליחת בקשה
                </button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default LawyersPage 