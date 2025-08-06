import classNames from 'classnames/bind'
import React, { useState } from 'react'
// Database-first migration: useTranslation removed in Phase 11
import { useNavigate } from 'react-router-dom'

import { Container } from '@src/components/ui/Container'
import { CaretRightIcon } from '@assets/icons/CaretRightIcon'
import LawyersFooter from './components/LawyersFooter'
import { useContentApi } from '@src/hooks/useContentApi'

import styles from './temporaryFranchise.module.scss'

const cx = classNames.bind(styles)

const TemporaryFranchise: React.FC = () => {
  // Database-first migration: t() hook removed in Phase 11
  const i18n = { language: 'en' } // Fallback for RTL detection
  const { getContent } = useContentApi('temporary_franchise')
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
                {getContent('franchise_main_hero_title', 'franchise_main_hero_title')}
              </h1>
              <div className={cx('main-hero-benefits')}>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>{getContent('franchise_main_hero_benefit_income', 'franchise_main_hero_benefit_income')}</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>{getContent('franchise_main_hero_benefit_turnover', 'franchise_main_hero_benefit_turnover')}</span>
                </div>
                <div className={cx('main-benefit-item')}>
                  <div className={cx('benefit-dot')}></div>
                  <span className={cx('main-benefit-text')}>{getContent('franchise_main_hero_benefit_roi', 'franchise_main_hero_benefit_roi')}</span>
                </div>
              </div>
              <button 
                className={cx('main-hero-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                {getContent('franchise_main_hero_cta', 'franchise_main_hero_cta')}
              </button>
            </div>
            <div className={cx('main-hero-right')}>
              <div className={cx('main-hero-image')}>
                <img 
                  src="/static/menu/franche_1.png" 
                  alt={getContent('franchise_alt_professional_meeting', 'franchise_alt_professional_meeting')}
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
                {getContent('franchise_hero_title', 'franchise_hero_title')}
              </h1>
              <p className={cx('hero-description')}>
                {getContent('franchise_hero_description', 'franchise_hero_description')}
              </p>
              <button 
                className={cx('hero-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                {getContent('franchise_hero_cta', 'franchise_hero_cta')}
              </button>
            </div>
            <div className={cx('hero-right')}>
              <div className={cx('hero-image')}>
                <img 
                  src="/static/menu/techRealt.png" 
                  alt={getContent('franchise_alt_techrealt_logo', 'franchise_alt_techrealt_logo')}
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
                  alt={getContent('franchise_alt_bankimonline_platform', 'franchise_alt_bankimonline_platform')}
                  className={cx('client-sources-img')}
                />
              </div>
            </div>
            <div className={cx('client-sources-right')}>
              <h2 className={cx('client-sources-title')}>
                {getContent('franchise_client_sources_title', 'franchise_client_sources_title')}
              </h2>
              <p className={cx('client-sources-description')}>
                {getContent('franchise_client_sources_description', 'franchise_client_sources_description')}
              </p>
              <div className={cx('client-services-grid')}>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>{getContent('franchise_client_service_mortgage_calc', 'franchise_client_service_mortgage_calc')}</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>{getContent('franchise_client_service_mortgage_refinance', 'franchise_client_service_mortgage_refinance')}</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>{getContent('franchise_client_service_credit_calc', 'franchise_client_service_credit_calc')}</span>
                </div>
                <div className={cx('client-service-item')}>
                  <div className={cx('service-bullet')}></div>
                  <span className={cx('client-service-name')}>{getContent('franchise_client_service_credit_refinance', 'franchise_client_service_credit_refinance')}</span>
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
                {getContent('franchise_partnership_title', 'franchise_partnership_title')}
              </h2>
              <p className={cx('partnership-description')}>
                {getContent('franchise_partnership_description', 'franchise_partnership_description')}
              </p>
              <div className={cx('partnership-services')}>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>{getContent('franchise_partnership_service_buy', 'franchise_partnership_service_buy')}</span>
                </div>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>{getContent('franchise_partnership_service_rent', 'franchise_partnership_service_rent')}</span>
                </div>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>{getContent('franchise_partnership_service_sell', 'franchise_partnership_service_sell')}</span>
                </div>
                <div className={cx('partnership-service-item')}>
                  <div className={cx('partnership-bullet')}></div>
                  <span className={cx('partnership-service-name')}>{getContent('franchise_partnership_service_lease', 'franchise_partnership_service_lease')}</span>
                </div>
              </div>
              <button 
                className={cx('partnership-cta-button')}
                onClick={() => navigate('/lawyers')}
              >
                {getContent('franchise_partnership_cta', 'franchise_partnership_cta')}
              </button>
            </div>
            <div className={cx('partnership-right')}>
              <div className={cx('partnership-image')}>
                <img 
                  src="/static/menu/keys.png" 
                  alt={getContent('franchise_alt_real_estate_keys', 'franchise_alt_real_estate_keys')}
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
            {getContent('franchise_includes_title', 'franchise_includes_title')}
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
                      {getContent('franchise_includes_turnkey_title', 'franchise_includes_turnkey_title')}
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
                          <span>{getContent('franchise_includes_turnkey_benefit_office', 'franchise_includes_turnkey_benefit_office')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>👥</div>
                          <span>{getContent('franchise_includes_turnkey_benefit_team', 'franchise_includes_turnkey_benefit_team')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>⚡</div>
                          <span>{getContent('franchise_includes_turnkey_benefit_brand', 'franchise_includes_turnkey_benefit_brand')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📈</div>
                          <span>{getContent('franchise_includes_turnkey_benefit_marketing', 'franchise_includes_turnkey_benefit_marketing')}</span>
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
                      {getContent('franchise_includes_digital_title', 'franchise_includes_digital_title')}
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
                          <span>{getContent('franchise_includes_digital_platform', 'franchise_includes_digital_platform')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📊</div>
                          <span>{getContent('franchise_includes_digital_tools', 'franchise_includes_digital_tools')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>🔧</div>
                          <span>{getContent('franchise_includes_digital_support', 'franchise_includes_digital_support')}</span>
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
                      {getContent('franchise_includes_support_title', 'franchise_includes_support_title')}
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
                          <span>{getContent('franchise_includes_support_training', 'franchise_includes_support_training')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📞</div>
                          <span>{getContent('franchise_includes_support_phone', 'franchise_includes_support_phone')}</span>
                        </div>
                        <div className={cx('benefit-item')}>
                          <div className={cx('benefit-icon')}>📈</div>
                          <span>{getContent('franchise_includes_support_consultation', 'franchise_includes_support_consultation')}</span>
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
                  {getContent('franchise_includes_cta', 'franchise_includes_cta')}
                </button>
              </div>
            </div>

            <div className={cx('franchise-includes-right')}>
              <div className={cx('office-image-container')}>
                <div className={cx('office-image')}>
                  <img 
                    src="/static/menu/franche_1.png" 
                    alt={getContent('franchise_alt_equipped_office', 'franchise_alt_equipped_office')}
                    className={cx('office-img')}
                  />
                </div>
                <div className={cx('floating-info-cards')}>
                  <div className={cx('info-card', 'info-card-1')}>
                    <div className={cx('info-card-icon')}>⚡</div>
                    <span className={cx('info-card-text')}>{getContent('franchise_includes_info_card_brand', 'franchise_includes_info_card_brand')}</span>
                  </div>
                  <div className={cx('info-card', 'info-card-2')}>
                    <div className={cx('info-card-icon')}>🏢</div>
                    <span className={cx('info-card-text')}>
                      {getContent('franchise_includes_info_card_office', 'franchise_includes_info_card_office')}<br/>
                      <small>{getContent('franchise_includes_info_card_manager', 'franchise_includes_info_card_manager')}</small>
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
            {getContent('franchise_how_to_open_title', 'franchise_how_to_open_title')}
          </h2>
          <div className={cx('franchise-steps-container')}>
            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>1</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  {getContent('franchise_step_1_title', 'franchise_step_1_title')}
                </h3>
                <p className={cx('franchise-step-description')}>
                  {getContent('franchise_step_1_description', 'franchise_step_1_description')}
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>2</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  {getContent('franchise_step_2_title', 'franchise_step_2_title')}
                </h3>
                <p className={cx('franchise-step-description')}>
                  {getContent('franchise_step_2_description', 'franchise_step_2_description')}
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>3</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  {getContent('franchise_step_3_title', 'franchise_step_3_title')}
                </h3>
                <p className={cx('franchise-step-description')}>
                  {getContent('franchise_step_3_description', 'franchise_step_3_description')}
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>4</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  {getContent('franchise_step_4_title', 'franchise_step_4_title')}
                </h3>
                <p className={cx('franchise-step-description')}>
                  {getContent('franchise_step_4_description', 'franchise_step_4_description')}
                </p>
              </div>
            </div>

            <div className={cx('franchise-step-card')}>
              <div className={cx('franchise-step-number')}>5</div>
              <div className={cx('franchise-step-content')}>
                <h3 className={cx('franchise-step-title')}>
                  {getContent('franchise_step_5_title', 'franchise_step_5_title')}
                </h3>
                <p className={cx('franchise-step-description')}>
                  {getContent('franchise_step_5_description', 'franchise_step_5_description')}
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
                {getContent('franchise_pricing_title', 'franchise_pricing_title')}
              </h2>
            </div>
            <div className={cx('pricing-right')}>
              <div className={cx('pricing-metrics-card')}>
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>{getContent('franchise_pricing_investments', 'franchise_pricing_investments')}</h3>
                  <div className={cx('metric-value')}>{getContent('franchise_pricing_investments_value', 'franchise_pricing_investments_value')}</div>
                </div>
                
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>{getContent('franchise_pricing_income', 'franchise_pricing_income')}</h3>
                  <div className={cx('metric-value')}>{getContent('franchise_pricing_income_value', 'franchise_pricing_income_value')}</div>
                </div>
                
                <div className={cx('pricing-metric-item')}>
                  <h3 className={cx('metric-label')}>{getContent('franchise_pricing_roi', 'franchise_pricing_roi')}</h3>
                  <div className={cx('metric-value')}>{getContent('franchise_pricing_roi_value', 'franchise_pricing_roi_value')}</div>
                </div>
                
                <div className={cx('pricing-note')}>
                  <div className={cx('pricing-bullet')}></div>
                  <span className={cx('pricing-note-text')}>
                    {getContent('franchise_pricing_note', 'franchise_pricing_note')}
                  </span>
                </div>
                
                <button 
                  className={cx('pricing-cta-button')}
                  onClick={() => navigate('/lawyers')}
                >
                  {getContent('franchise_pricing_cta', 'franchise_pricing_cta')}
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
                <h2 className={cx('final-cta-title')} dangerouslySetInnerHTML={{ __html: getContent('franchise_final_cta_title', 'franchise_final_cta_title') }}>
                </h2>
                <button 
                  className={cx('final-cta-button')}
                  onClick={() => navigate('/lawyers', { 
                    state: { source: 'temporary-franchise-page' } 
                  })}
                >
                  {getContent('franchise_final_cta_button', 'franchise_final_cta_button')}
                  <span className={cx('final-cta-arrow')}>{getContent('franchise_final_cta_arrow', 'franchise_final_cta_arrow')}</span>
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <LawyersFooter />

    </div>
  )
}

export default TemporaryFranchise 