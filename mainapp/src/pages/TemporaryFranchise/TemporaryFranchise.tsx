import classNames from 'classnames/bind'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'

import styles from './temporaryFranchise.module.scss'

const cx = classNames.bind(styles)

const TemporaryFranchise: React.FC = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [openFeature, setOpenFeature] = useState<number | null>(null)

  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index)
  }

  return (
    <div className={cx('temporary-franchise', { rtl: i18n.language === 'he' })}>

      {/* Main Hero Section */}
      <section className={cx('main-hero-section')}>
        <Container>
          <div className={cx('main-hero-content')}>
            <div className={cx('main-hero-left')}>
              <h1 className={cx('main-hero-title')}>
                Bankimonline מזמינה מתווכי משכנתאות: פתחו היום את המשרד המצליח שלכם!
              </h1>
              <div className={cx('main-hero-benefits')}>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>הכנסה עד ₪300,000 בשנה</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>מחזור עד ₪300,000</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>החזר השקעה תוך 12 חודשים</span>
                </div>
              </div>
              <button 
                className={cx('main-hero-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                מלאו טופס
              </button>
            </div>
            <div className={cx('main-hero-right')}>
              <div className={cx('main-hero-image')}>
                <img 
                  src="/static/menu/franche_1.png" 
                  alt="TechRealt Professional Meeting" 
                  className={cx('main-hero-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Hero Section */}
      <section className={cx('hero-section')}>
        <Container>
          <div className={cx('hero-content')}>
            <div className={cx('hero-left')}>
              <h1 className={cx('hero-title')}>
                Techrealt – מרקטפלייס נדל"ן
              </h1>
              <p className={cx('hero-description')}>
                חברת Techrealt מספקת ללקוחותיה ולשותפיה פלטפורמה דיגיטלית אחידה לרכישה, מכירה, השכרה והשכרת נכסי נדל"ן. נכון לעת הזו, השירות מצוי בשלבי פיתוח.
              </p>
              <button 
                className={cx('hero-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                מלאו טופס
              </button>
            </div>
            <div className={cx('hero-right')}>
              <div className={cx('hero-image')}>
                <img 
                  src="/static/menu/techRealt.png" 
                  alt="TechRealt Logo" 
                  className={cx('hero-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Client Sources Section */}
      <section className={cx('client-sources-section')}>
        <Container>
          <div className={cx('client-sources-content')}>
            <div className={cx('client-sources-left')}>
              <div className={cx('client-sources-image')}>
                <img 
                  src="/static/primary-logo05-1.svg" 
                  alt="Bankimonline Platform" 
                  className={cx('client-sources-img')}
                />
              </div>
            </div>
            <div className={cx('client-sources-right')}>
              <div className={cx('client-sources-badge')}>
                מקור #5
              </div>
              <h2 className={cx('client-sources-title')}>
                מאיפה אנו מביאים לקוחות
              </h2>
              <p className={cx('client-sources-description')}>
                הפלטפורמה שלנו משולבת עם Bankimonline - שירות דיגיטלי אחיד לכל סוגי האשראי המשכנתי. לקוחות Bankimonline המעוניינים ברכישת נדל"ן נכללים במאגר הלקוחות של TechRealt.
              </p>
              <div className={cx('client-services-grid')}>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>חישוב משכנתא</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>מחזור משכנתא</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>חישוב אשראי</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>מחזור אשראי</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Partnership Section */}
      <section className={cx('partnership-section')}>
        <Container>
          <div className={cx('partnership-content')}>
            <div className={cx('partnership-left')}>
              <h2 className={cx('partnership-title')}>
                הפכו לשותף בלעדי של TechRealt באזורכם והשיגו רווחים יחד איתנו.
              </h2>
              <p className={cx('partnership-description')}>
                אנו מביאים את הלקוחות - אתם חותמים על עסקאות הנדל"ן.
              </p>
              <div className={cx('partnership-services')}>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>רכישת נדל"ן</span>
                </div>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>השכרת נדל"ן</span>
                </div>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>השכרה</span>
                </div>
              </div>
              <div className={cx('partnership-additional-service')}>
                <div className={cx('partnership-bullet')}></div>
                <span className={cx('partnership-service-name')}>מכירת נדל"ן</span>
              </div>
              <button 
                className={cx('partnership-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                הגשת בקשה
              </button>
            </div>
            <div className={cx('partnership-right')}>
              <div className={cx('partnership-image')}>
                <img 
                  src="/static/menu/keys.png" 
                  alt="מפתחות נדל״ן" 
                  className={cx('partnership-img')}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Franchise Includes Section */}
      <section className={cx('franchise-includes-section')}>
        <Container>
          <h2 className={cx('franchise-includes-title')}>
            מה כלול בזיכיון?
          </h2>
          <div className={cx('franchise-includes-content')}>
            <div className={cx('franchise-includes-left')}>
              <div className={cx('includes-accordion')}>
                <div className={cx('accordion-item')}>
                  <button
                    className={cx('accordion-header', { active: openFeature === 0 })}
                    onClick={() => toggleFeature(0)}
                  >
                    <h3 className={cx('accordion-title')}>
                      עסק "TURNKEY" – מוכן להפעלה מלאה, עם משרד מצויד ובסיס לקוחות מוכן לפעילות
                    </h3>
                    <div className={cx('accordion-arrow', { rotated: openFeature === 0 })}>
                      <CaretRightIcon />
                    </div>
                  </button>
                  {openFeature === 0 && (
                    <div className={cx('accordion-content')}>
                      <div className={cx('accordion-benefits')}>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🏢</div>
                          <span>אתם מקבלים משרד מאובזר תחת הניהול שלכם</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>👥</div>
                          <span>אתם מקבלים צוות מיומן</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>⚡</div>
                          <span>אתם מקבלים זכויות להשתמש במותג שלנו</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📈</div>
                          <span>אנו לוקחים על עצמנו את הוצאות השיווק</span>
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
                      שירותים דיגיטליים לפיתוח עסקי מוצלח
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
                          <span>פלטפורמה דיגיטלית מתקדמת</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📊</div>
                          <span>כלים לניהול ומעקב עסקים</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🔧</div>
                          <span>תמיכה טכנית מתמשכת</span>
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
                      תמיכה מידע מלאה
                    </h3>
                    <div className={cx('accordion-arrow', { rotated: openFeature === 2 })}>
                      <CaretRightIcon />
                    </div>
                  </button>
                  {openFeature === 2 && (
                    <div className={cx('accordion-content')}>
                      <div className={cx('accordion-benefits')}>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📚</div>
                          <span>הדרכה מקיפה וחומרי לימוד</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📞</div>
                          <span>תמיכה טלפונית 24/7</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📈</div>
                          <span>ייעוץ עסקי מתמשך</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={cx('franchise-cta-container')}>
                <button 
                  className={cx('franchise-cta-button')}
                  onClick={() => navigate('/lawyers')}
                >
                  קבלת ייעוץ
                </button>
              </div>
            </div>

            <div className={cx('franchise-includes-right')}>
              <div className={cx('office-image-container')}>
                <div className={cx('office-image')}>
                  <img 
                    src="/static/menu/franche_1.png" 
                    alt="משרד מאובזר" 
                    className={cx('office-img')}
                  />
                </div>
                <div className={cx('floating-info-cards')}>
                  <div className={cx('info-card', 'info-card-1')}>
                    <div className={cx('info-card-icon')}>⚡</div>
                    <span className={cx('info-card-text')}>זכויות להשתמש במותג שלנו</span>
                  </div>
                  <div className={cx('info-card', 'info-card-2')}>
                    <div className={cx('info-card-icon')}>🏢</div>
                    <span className={cx('info-card-text')}>
                      קבלת משרד מאובזר תחת הניהול שלכם<br/>
                      <small>פרטי המנהל</small>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How to Open Franchise Section */}
      <section className={cx('how-to-open-section')}>
        <Container>
          <h2 className={cx('how-to-open-title')}>
            כיצד לפתוח זיכיון
          </h2>
          <div className={cx('franchise-steps-container')}>
            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>1</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  מלאו שאלון באתר שלנו
                </h3>
                <p className={cx('franchise-step-description')}>
                  פשוט מלאו שאלון קצר באתר שלנו, כדי להתחבר לתוכנית שלנו
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>2</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  הנציג שלנו ייצור עמכם קשר
                </h3>
                <p className={cx('franchise-step-description')}>
                  אנו נקבע פגישה עם מנהל כללי, שיערוך עמכם ראיון
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>3</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  אנו נחתום הסכם סוכנות על העברת לקוחות ייחודיים לכם
                </h3>
                <p className={cx('franchise-step-description')}>
                  אם אתם מתאימים לנו אנו נחתום הסכם לפיו נעביר לכם לקוחות בלעדיים
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>4</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  אנו פותחים לכם משרד ומלמדים אתכם לעבוד עם השירותים הדיגיטליים שלנו
                </h3>
                <p className={cx('franchise-step-description')}>
                  אנו נפתח משרד ונספק ציוד לעבודה נוחה. אנו נלמד אתכם את כל הדקויות של העבודה עם השירותים הדיגיטליים של TechRealt, כדי להקים תהליכי עסק למשרד שלכם.
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>5</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  אתם מקבלים הכנסה יציבה בתנאים אישיים
                </h3>
                <p className={cx('franchise-step-description')}>
                  השירותים הדיגיטליים של TechRealt פועלים 24/7, כדי שתקבלו הכנסה יציבה בהתאמה לתנאים האישיים של הסכם הסוכנות
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Franchise Pricing Section */}
      <section className={cx('franchise-pricing-section')}>
        <Container>
          <div className={cx('pricing-content')}>
            <div className={cx('pricing-left')}>
              <h2 className={cx('pricing-main-title')}>
                עלות הזיכיון והכנסתכם
              </h2>
            </div>
            <div className={cx('pricing-right')}>
              <div className={cx('pricing-metrics-card')}>
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>השקעות</h3>
                  <div className={cx('metric-value')}>עד 300,000 ₪</div>
                </div>
                
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>הכנסה</h3>
                  <div className={cx('metric-value')}>עד 30,000 ₪</div>
                </div>
                
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>החזר השקעה</h3>
                  <div className={cx('metric-value')}>מ-10 עד 12 חודשים</div>
                </div>
                
                <div className={cx('pricing-note')}>
                  <div className={cx('pricing-bullet')}></div>
                  <span className={cx('pricing-note-text')}>
                    בהתאם לניסיונכם ויכולותיכם אנו נציע לכם הצעה אישית
                  </span>
                </div>
                
                <button 
                  className={cx('pricing-cta-button')}
                  onClick={() => navigate('/lawyers')}
                >
                  מלאו שאלון
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
                  רוצים לקבל הכנסה יציבה?<br/>
                  TechRealt יעזור לכם בכך.
                </h2>
                <button 
                  className={cx('final-cta-button')}
                  onClick={() => navigate('/lawyers')}
                >
                  מלאו שאלון
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

export default TemporaryFranchise 