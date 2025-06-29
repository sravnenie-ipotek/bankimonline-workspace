import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'
import Container from '../../components/ui/Container/Container.tsx'
import styles from './contacts.module.scss'

const cx = classNames.bind(styles)

interface ContactSection {
  id: string
  title: string
  items: ContactItem[]
}

interface ContactItem {
  title: string
  phone?: string
  email?: string
  whatsapp?: string
  description?: string
}

interface SocialLink {
  name: string
  url: string
  icon: string
}

const Contacts: React.FC = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('general')

  // Main company contact info
  const mainContacts = {
    address: t('contacts_address'),
    phone: '04-6232280',
    email: 'info@bankimonline.com'
  }

  // Contact categories/tabs
  const contactCategories = [
    { id: 'general', title: t('contacts_general_questions'), key: 'general' },
    { id: 'services', title: t('contacts_service_questions'), key: 'services' },
    { id: 'realestate', title: t('contacts_realestate_questions'), key: 'realestate' },
    { id: 'cooperation', title: t('contacts_cooperation'), key: 'cooperation' }
  ]

  // Contact sections data
  const contactSections: Record<string, ContactSection[]> = {
    general: [
      {
        id: 'tech-support',
        title: t('contacts_tech_support'),
        items: [
          {
            title: t('contacts_tech_support'),
            phone: '04-6232280',
            email: 'support@bankimonline.com',
            whatsapp: '+972546232280'
          }
        ]
      },
      {
        id: 'general-info',
        title: t('contacts_general_info'),
        items: [
          {
            title: t('contacts_general_info'),
            phone: '04-6232280',
            email: 'info@bankimonline.com',
            whatsapp: '+972546232280'
          }
        ]
      },
      {
        id: 'customer-service',
        title: t('contacts_customer_service'),
        items: [
          {
            title: t('contacts_customer_service'),
            phone: '04-6232280',
            email: 'customerservice@bankimonline.com',
            whatsapp: '+972546232280'
          }
        ]
      }
    ],
    services: [
      {
        id: 'mortgage-services',
        title: t('contacts_mortgage_refinance'),
        items: [
          {
            title: t('contacts_mortgage_refinance'),
            phone: '046232276',
            email: 'mortgage@bankimonline.com',
            whatsapp: '+972546232276',
            description: t('contacts_mortgage_desc')
          }
        ]
      },
      {
        id: 'credit-services',
        title: t('contacts_credit_refinance'),
        items: [
          {
            title: t('contacts_credit_refinance'),
            phone: '046232276',
            email: 'loans@bankimonline.com',
            whatsapp: '+972546232276',
            description: t('contacts_credit_desc')
          }
        ]
      }
    ],
    realestate: [
      {
        id: 'buy-sell',
        title: t('contacts_buy_sell_realestate'),
        items: [
          {
            title: t('contacts_buy_sell_realestate'),
            phone: '046232275',
            email: 'realestate@bankimonline.com',
            whatsapp: '+972546232275',
            description: t('contacts_buy_sell_desc')
          }
        ]
      },
      {
        id: 'rental',
        title: t('contacts_rental_realestate'),
        items: [
          {
            title: t('contacts_rental_realestate'),
            phone: '046232275',
            email: 'realestate@bankimonline.com',
            whatsapp: '+972546232275',
            description: t('contacts_rental_desc')
          }
        ]
      }
    ],
    cooperation: [
      {
        id: 'partnerships',
        title: t('contacts_partnerships_management'),
        items: [
          {
            title: t('contacts_partnerships_management'),
            phone: '046232277',
            email: 'partnerships@bankimonline.com',
            whatsapp: '+972546232277'
          }
        ]
      },
      {
        id: 'management',
        title: t('contacts_management'),
        items: [
          {
            title: t('contacts_management'),
            phone: '046232277',
            email: 'founder@bankimonline.com',
            whatsapp: '+972546232277'
          }
        ]
      },
      {
        id: 'accounting',
        title: t('contacts_accounting'),
        items: [
          {
            title: t('contacts_accounting'),
            phone: '046232277',
            email: 'accountant@bankimonline.com',
            whatsapp: '+972546232277'
          }
        ]
      },
      {
        id: 'fax',
        title: t('contacts_fax'),
        items: [
          {
            title: t('contacts_fax_number'),
            phone: '046232278'
          }
        ]
      }
    ]
  }

  // Social media links
  const socialLinks: SocialLink[] = [
    { name: 'Instagram', url: 'https://instagram.com/bankimonline', icon: 'instagram' },
    { name: 'YouTube', url: 'https://youtube.com/bankimonline', icon: 'youtube' },
    { name: 'Facebook', url: 'https://facebook.com/bankimonline', icon: 'facebook' },
    { name: 'Twitter', url: 'https://twitter.com/bankimonline', icon: 'twitter' },
    { name: 'WhatsApp', url: 'https://wa.me/972546232280', icon: 'whatsapp' }
  ]

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    // Scroll to the corresponding section
    const element = document.getElementById(`section-${tabId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleContactClick = (type: string, value: string) => {
    switch (type) {
      case 'phone':
        window.open(`tel:${value}`, '_self')
        break
      case 'email':
        window.open(`mailto:${value}`, '_self')
        break
      case 'whatsapp':
        window.open(`https://wa.me/${value.replace(/[^0-9]/g, '')}`, '_blank')
        break
      default:
        break
    }
  }

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank')
  }

  const renderContactCard = (item: ContactItem, index: number) => (
    <div key={index} className={cx('contact-card')}>
      <h4 className={cx('contact-card-title')}>{item.title}</h4>
      {item.description && (
        <p className={cx('contact-card-description')}>{item.description}</p>
      )}
      <div className={cx('contact-card-info')}>
        {item.phone && (
          <div className={cx('contact-item')}>
            <span className={cx('contact-label')}>{t('contacts_phone')}:</span>
            <button
              className={cx('contact-link')}
              onClick={() => handleContactClick('phone', item.phone!)}
            >
              {item.phone}
            </button>
          </div>
        )}
        {item.email && (
          <div className={cx('contact-item')}>
            <span className={cx('contact-label')}>{t('contacts_email')}:</span>
            <button
              className={cx('contact-link')}
              onClick={() => handleContactClick('email', item.email!)}
            >
              {item.email}
            </button>
          </div>
        )}
        {item.whatsapp && (
          <div className={cx('contact-item')}>
            <span className={cx('contact-label')}>WhatsApp:</span>
            <button
              className={cx('contact-link', 'whatsapp')}
              onClick={() => handleContactClick('whatsapp', item.whatsapp!)}
            >
              {item.whatsapp}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={cx('contacts')}>
      <Container>
        {/* Main Contact Info Section */}
        <section className={cx('hero-section')}>
          <div className={cx('hero-content')}>
            <h1 className={cx('page-title')}>{t('contacts_title')}</h1>
            <div className={cx('main-contact-info')}>
              <div className={cx('main-contact-item')}>
                <h3>{t('contacts_main_office')}</h3>
                <p className={cx('address')}>{mainContacts.address}</p>
              </div>
              <div className={cx('main-contact-item')}>
                <h3>{t('contacts_phone')}</h3>
                <button
                  className={cx('main-contact-link')}
                  onClick={() => handleContactClick('phone', mainContacts.phone)}
                >
                  {mainContacts.phone}
                </button>
              </div>
              <div className={cx('main-contact-item')}>
                <h3>{t('contacts_email')}</h3>
                <button
                  className={cx('main-contact-link')}
                  onClick={() => handleContactClick('email', mainContacts.email)}
                >
                  {mainContacts.email}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Categories Navigation */}
        <section className={cx('categories-section')}>
          <div className={cx('categories-nav')}>
            {contactCategories.map((category) => (
              <button
                key={category.id}
                className={cx('category-button', {
                  active: activeTab === category.id
                })}
                onClick={() => handleTabClick(category.id)}
              >
                {category.title}
              </button>
            ))}
          </div>
        </section>

        {/* Contact Sections */}
        {Object.entries(contactSections).map(([sectionKey, sections]) => (
          <section
            key={sectionKey}
            id={`section-${sectionKey}`}
            className={cx('contact-section', {
              active: activeTab === sectionKey
            })}
          >
            <div className={cx('section-content')}>
              {sections.map((section) => (
                <div key={section.id} className={cx('section-group')}>
                  <h2 className={cx('section-title')}>{section.title}</h2>
                  <div className={cx('contact-cards')}>
                    {section.items.map((item, index) => renderContactCard(item, index))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Social Media Section */}
        <section className={cx('social-section')}>
          <h2 className={cx('social-title')}>{t('contacts_follow_us')}</h2>
          <div className={cx('social-links')}>
            {socialLinks.map((social) => (
              <button
                key={social.name}
                className={cx('social-link', social.icon)}
                onClick={() => handleSocialClick(social.url)}
                aria-label={`${t('contacts_follow_us')} ${social.name}`}
              >
                <span className={cx('social-icon')}></span>
                <span className={cx('social-name')}>{social.name}</span>
              </button>
            ))}
          </div>
        </section>
      </Container>
    </div>
  )
}

export default Contacts
