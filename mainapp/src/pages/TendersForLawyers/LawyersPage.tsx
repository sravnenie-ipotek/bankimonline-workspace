import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './lawyersPage.module.scss'

const cx = classNames.bind(styles)

const LawyersPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [openFeature, setOpenFeature] = useState<number | null>(null)

  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index)
  }

  return (
    <div className={cx('lawyers-page', { rtl: i18n.language === 'he' })}>

      {/* Main Hero Section */}
      <section className={cx('main-hero-section')}>
        <Container>
          <div className={cx('main-hero-content')}>
            <div className={cx('main-hero-left')}>
              <h1 className={cx('main-hero-title')}>
                עורכי דין ויועצים משפטיים: הצטרפו לרשת המובילה של TechRealt
              </h1>
              <div className={cx('main-hero-benefits')}>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>הכנסה עד ₪400,000 בשנה</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>מעל 500 לקוחות פוטנציאליים חודשיים</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>תמיכה טכנולוגית מתקדמת</span>
                </div>
              </div>
              <button className={cx('main-hero-cta-button')}>
                הגשת מועמדות
              </button>
            </div>
            <div className={cx('main-hero-right')}>
              <div className={cx('main-hero-image')}>
                <img 
                  src="/static/menu/franche_1.png" 
                  alt="עורכי דין מקצועיים" 
                  className={cx('main-hero-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section className={cx('services-section')}>
        <Container>
          <div className={cx('services-content')}>
            <div className={cx('services-left')}>
              <h2 className={cx('services-title')}>
                השירותים המשפטיים שאנו מחפשים
              </h2>
              <p className={cx('services-description')}>
                אנו מחפשים עורכי דין מומחים בתחומי הנדל"ן, הפיננסים והבנקאות. הצטרפו אלינו ותהיו חלק מהפלטפורמה המשפטית המובילה בישראל.
              </p>
              <div className={cx('services-list')}>
                <div className={cx('service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('service-name')}>ייעוץ משפטי בעסקאות נדל"ן</span>
                </div>
                <div className={cx('service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('service-name')}>ליווי משפטי במשכנתאות</span>
                </div>
                <div className={cx('service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('service-name')}>ביקורת חוזים ומסמכים</span>
                </div>
                <div className={cx('service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('service-name')}>ייצוג בבנקים ומוסדות פיננסיים</span>
                </div>
              </div>
            </div>
            <div className={cx('services-right')}>
              <div className={cx('services-image')}>
                <img 
                  src="/static/primary-logo05-1.svg" 
                  alt="שירותים משפטיים דיגיטליים" 
                  className={cx('services-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className={cx('benefits-section')}>
        <Container>
          <div className={cx('benefits-content')}>
            <div className={cx('benefits-left')}>
              <h2 className={cx('benefits-title')}>
                למה לבחור בשותפות עם TechRealt?
              </h2>
              <p className={cx('benefits-description')}>
                הצטרפו לפלטפורמה דיגיטלית מתקדמת שמביאה אליכם לקוחות איכותיים ומאפשרת לכם להתמחות במה שאתם הכי טובים בו.
              </p>
              <div className={cx('benefits-services')}>
                <div className={cx('benefits-service-item')}>
                  <div className={cx('benefits-bullet')}></div>
                  <span className={cx('benefits-service-name')}>זרם לקוחות קבוע</span>
                </div>
                <div className={cx('benefits-service-item')}>
                  <div className={cx('benefits-bullet')}></div>
                  <span className={cx('benefits-service-name')}>מערכת ניהול לקוחות CRM</span>
                </div>
                <div className={cx('benefits-service-item')}>
                  <div className={cx('benefits-bullet')}></div>
                  <span className={cx('benefits-service-name')}>תמיכה שיווקית ופרסומית</span>
                </div>
                <div className={cx('benefits-service-item')}>
                  <div className={cx('benefits-bullet')}></div>
                  <span className={cx('benefits-service-name')}>חשבוניות ותשלומים דיגיטליים</span>
                </div>
              </div>
              <button className={cx('benefits-cta-button')}>
                קבלת פרטים נוספים
              </button>
            </div>
            <div className={cx('benefits-right')}>
              <div className={cx('benefits-image')}>
                <img 
                  src="/static/menu/keys.png" 
                  alt="יתרונות השותפות" 
                  className={cx('benefits-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Requirements Section */}
      <section className={cx('requirements-section')}>
        <Container>
          <h2 className={cx('requirements-title')}>
            דרישות להצטרפות
          </h2>
          <div className={cx('requirements-content')}>
            <div className={cx('requirements-left')}>
              <div className={cx('requirements-accordion')}>
                <div className={cx('accordion-item')}>
                  <button
                    className={cx('accordion-header', { active: openFeature === 0 })}
                    onClick={() => toggleFeature(0)}
                  >
                    <h3 className={cx('accordion-title')}>
                      רישיון עורך דין תקף וניסיון מוכח
                    </h3>
                    <div className={cx('accordion-arrow', { rotated: openFeature === 0 })}>
                      <CaretRightIcon />
                    </div>
                  </button>
                  {openFeature === 0 && (
                    <div className={cx('accordion-content')}>
                      <div className={cx('accordion-benefits')}>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>⚖️</div>
                          <span>רישיון עורך דין תקף מלשכת עורכי הדין</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📈</div>
                          <span>ניסיון של לפחות 3 שנים בתחום הנדל"ן</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🏆</div>
                          <span>מוניטין מקצועי וממליצים</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🎯</div>
                          <span>התמחות בעסקאות נדל"ן ומשכנתאות</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cx('accordion-item')}>
                  <button
                    className={cx('accordion-header', { active: openFeature === 1 })}
                    onClick={() => toggleFeature(1)}
                  >
                    <h3 className={cx('accordion-title')}>
                      יכולות טכנולוגיות ודיגיטליות
                    </h3>
                    <div className={cx('accordion-arrow', { rotated: openFeature === 1 })}>
                      <CaretRightIcon />
                    </div>
                  </button>
                  {openFeature === 1 && (
                    <div className={cx('accordion-content')}>
                      <div className={cx('accordion-benefits')}>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>💻</div>
                          <span>שליטה במערכות CRM ותוכנות ניהול</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📱</div>
                          <span>נוחות עם טכנולוגיות דיגיטליות</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🔒</div>
                          <span>הבנה בנושאי אבטחת מידע ופרטיות</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cx('accordion-item')}>
                  <button
                    className={cx('accordion-header', { active: openFeature === 2 })}
                    onClick={() => toggleFeature(2)}
                  >
                    <h3 className={cx('accordion-title')}>
                      זמינות ומחויבות מקצועית
                    </h3>
                    <div className={cx('accordion-arrow', { rotated: openFeature === 2 })}>
                      <CaretRightIcon />
                    </div>
                  </button>
                  {openFeature === 2 && (
                    <div className={cx('accordion-content')}>
                      <div className={cx('accordion-benefits')}>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>⏰</div>
                          <span>זמינות למענה מהיר לפניות לקוחות</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🤝</div>
                          <span>מחויבות לשירות מעולה ומקצועי</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📋</div>
                          <span>יכולת לעמוד ביעדים ולוחות זמנים</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={cx('requirements-cta-container')}>
                <button className={cx('requirements-cta-button')}>
                  בדיקת התאמה
                </button>
              </div>
            </div>

            <div className={cx('requirements-right')}>
              <div className={cx('professional-image-container')}>
                <div className={cx('professional-image')}>
                  <img 
                    src="/static/menu/franche_1.png" 
                    alt="עורך דין מקצועי" 
                    className={cx('professional-img')}
                  />
                </div>
                <div className={cx('floating-info-cards')}>
                  <div className={cx('info-card', 'info-card-1')}>
                    <div className={cx('info-card-icon')}>⚖️</div>
                    <span className={cx('info-card-text')}>רישיון עורך דין תקף</span>
                  </div>
                  <div className={cx('info-card', 'info-card-2')}>
                    <div className={cx('info-card-icon')}>🏢</div>
                    <span className={cx('info-card-text')}>
                      התמחות בעסקאות נדל"ן<br/>
                      <small>ומשכנתאות</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Process Steps Section */}
      <section className={cx('process-steps-section')}>
        <Container>
          <h2 className={cx('process-steps-title')}>
            תהליך ההצטרפות
          </h2>
          <div className={cx('process-steps-grid')}>
            <div className={cx('process-step-card')}>
              <div className={cx('process-step-number')}>1</div>
              <div className={cx('process-step-content')}>
                <h3 className={cx('process-step-title')}>
                  הגשת מועמדות וקורות חיים
                </h3>
                <p className={cx('process-step-description')}>
                  מלאו טופס מקוון והעלו קורות חיים מקצועיים הכוללים את הניסיון שלכם בתחום הנדל"ן והמשכנתאות.
                </p>
              </div>
            </div>

            <div className={cx('process-step-card')}>
              <div className={cx('process-step-number')}>2</div>
              <div className={cx('process-step-content')}>
                <h3 className={cx('process-step-title')}>
                  ראיון מקצועי וערכת התאמה
                </h3>
                <p className={cx('process-step-description')}>
                  נקיים ראיון מקצועי לבדיקת ההתאמה שלכם לפלטפורמה ולבירור הציפיות ההדדיות מהשותפות.
                </p>
              </div>
            </div>

            <div className={cx('process-step-card')}>
              <div className={cx('process-step-number')}>3</div>
              <div className={cx('process-step-content')}>
                <h3 className={cx('process-step-title')}>
                  חתימה על הסכם שותפות
                </h3>
                <p className={cx('process-step-description')}>
                  לאחר הוכחת ההתאמה, נחתום על הסכם שותפות שיגדיר את התנאים, התמורה ואופן העבודה המשותפת.
                </p>
              </div>
            </div>

            <div className={cx('process-step-card')}>
              <div className={cx('process-step-number')}>4</div>
              <div className={cx('process-step-content')}>
                <h3 className={cx('process-step-title')}>
                  הדרכה והטמעה במערכת
                </h3>
                <p className={cx('process-step-description')}>
                  נספק הדרכה מקיפה על המערכת הדיגיטלית, תהליכי העבודה ואופן קבלת הלקוחות וניהולם בפלטפורמה.
                </p>
              </div>
            </div>

            <div className={cx('process-step-card')}>
              <div className={cx('process-step-number')}>5</div>
              <div className={cx('process-step-content')}>
                <h3 className={cx('process-step-title')}>
                  תחילת פעילות וקבלת לקוחות
                </h3>
                <p className={cx('process-step-description')}>
                  תתחילו לקבל הפניות לקוחות דרך הפלטפורמה ותוכלו להתחיל לבנות את התיק שלכם ולהגדיל את ההכנסות.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Compensation Section */}
      <section className={cx('compensation-section')}>
        <Container>
          <div className={cx('compensation-content')}>
            <div className={cx('compensation-left')}>
              <h2 className={cx('compensation-main-title')}>
                מבנה התמורה והעמלות
              </h2>
            </div>
            <div className={cx('compensation-right')}>
              <div className={cx('compensation-metrics-card')}>
                <div className={cx('compensation-metric-item')}>
                  <h3 className={cx('metric-label')}>עמלה ממוצעת לעסקה</h3>
                  <div className={cx('metric-value')}>₪8,000-15,000</div>
                </div>
                
                <div className={cx('compensation-metric-item')}>
                  <h3 className={cx('metric-label')}>הכנסה חודשית פוטנציאלית</h3>
                  <div className={cx('metric-value')}>₪25,000-40,000</div>
                </div>
                
                <div className={cx('compensation-metric-item')}>
                  <h3 className={cx('metric-label')}>מספר עסקאות חודשיות</h3>
                  <div className={cx('metric-value')}>3-5 עסקאות</div>
                </div>
                
                <div className={cx('compensation-note')}>
                  <div className={cx('compensation-bullet')}></div>
                  <span className={cx('compensation-note-text')}>
                    התמורה משתנה בהתאם למורכבות העסקה ולהיקף השירותים הנדרשים
                  </span>
                </div>
                
                <button className={cx('compensation-cta-button')}>
                  פרטים על התמורה
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA Section */}
      <section className={cx('final-cta-section')}>
        <Container>
          <div className={cx('final-cta-content')}>
            <div className={cx('final-cta-card')}>
              <div className={cx('final-cta-main')}>
                <h2 className={cx('final-cta-title')}>
                  מוכנים להגדיל את התיק שלכם?<br/>
                  הצטרפו ל-TechRealt עוד היום.
                </h2>
                <button className={cx('final-cta-button')}>
                  הגשת מועמדות
                  <span className={cx('final-cta-arrow')}>←</span>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

    </div>
  )
}

export default LawyersPage 