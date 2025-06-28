import React, { useState } from 'react';
import './MainPage.css';

// Import icons and images
import ArrowRightIcon from '../../assets/icons/ArrowRightIcon';
import ArrowsOutSimpleIcon from '../../assets/icons/ArrowsOutSimpleIcon';
import InstagramIcon from '../../assets/icons/InstagramIcon';
import YoutubeIcon from '../../assets/icons/YoutubeIcon';
import FacebookIcon from '../../assets/icons/FacebookIcon';
import TwitterIcon from '../../assets/icons/TwitterIcon';
import WhatsappIcon from '../../assets/icons/WhatsappIcon';
import EnvelopeIcon from '../../assets/icons/EnvelopeIcon';
import PhoneIcon from '../../assets/icons/PhoneIcon';
import ListIcon from '../../assets/icons/ListIcon';
import CloseIcon from '../../assets/icons/CloseIcon';
import CalculatorIcon from '../../assets/icons/CalculatorIcon';
import ClipboardIcon from '../../assets/icons/ClipboardIcon';
import BankIcon from '../../assets/icons/BankIcon';
import CookieIcon from '../../assets/icons/CookieIcon';

interface MainPageProps {}

const MainPage: React.FC<MainPageProps> = () => {
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('Россия');

  // Action handlers (34 total actions)
  const handleAction1 = () => console.log('Действие #1: Войти в личный кабинет'); // Action 1
  const handleAction2 = () => console.log('Действие #2: Открыть боковое меню'); // Action 2
  const handleAction3 = () => console.log('Действие #3: Навигация по меню'); // Action 3
  const handleAction4 = () => console.log('Действие #4: Включить/выключить звук'); // Action 4
  const handleAction5 = () => console.log('Действие #5: Полноэкранный режим видео'); // Action 5
  const handleAction6 = () => console.log('Действие #6: Боковая навигация'); // Action 6
  const handleAction7 = () => console.log('Действие #7: Рассчитать ипотеку'); // Action 7
  const handleAction8 = () => console.log('Действие #8: Рефинансирование ипотеки'); // Action 8
  const handleAction9 = () => console.log('Действие #9: Рассчитать кредит'); // Action 9
  const handleAction10 = () => console.log('Действие #10: Рефинансирование кредита'); // Action 10
  const handleAction11 = () => console.log('Действие #11: Партнеры - следующий'); // Action 11
  const handleAction12 = () => console.log('Действие #12: Как это работает - шаг 1'); // Action 12
  const handleAction13 = () => console.log('Действие #13: Принять куки'); // Action 13
  const handleAction14 = () => console.log('Действие #14: Контакты в футере'); // Action 14
  const handleAction15 = () => console.log('Действие #15: О нас в футере'); // Action 15
  const handleAction16 = () => console.log('Действие #16: Вакансии в футере'); // Action 16
  const handleAction17 = () => console.log('Действие #17: Сотрудничество в футере'); // Action 17
  const handleAction18 = () => console.log('Действие #18: Закрыть куки'); // Action 18
  const handleAction19 = () => console.log('Действие #19: Email контакт'); // Action 19
  const handleAction20 = () => console.log('Действие #20: Телефон контакт'); // Action 20
  const handleAction21 = () => console.log('Действие #21: WhatsApp контакт'); // Action 21
  const handleAction22 = () => console.log('Действие #22: Пользовательское соглашение'); // Action 22
  const handleAction23 = () => console.log('Действие #23: Политика конфиденциальности'); // Action 23
  const handleAction24 = () => console.log('Действие #24: Использование куки'); // Action 24
  const handleAction25 = () => console.log('Действие #25: Политика возврата'); // Action 25
  const handleAction26 = () => console.log('Действие #26: Instagram'); // Action 26
  const handleAction27 = () => console.log('Действие #27: YouTube'); // Action 27
  const handleAction28 = () => console.log('Действие #28: Facebook'); // Action 28
  const handleAction29 = () => console.log('Действие #29: Twitter'); // Action 29
  const handleAction30 = () => console.log('Действие #30: Как это работает - шаг 2'); // Action 30
  const handleAction31 = () => console.log('Действие #31: Как это работает - шаг 3'); // Action 31
  const handleAction32 = () => console.log('Действие #32: Выбор страны'); // Action 32
  const handleAction33 = () => console.log('Действие #33: Языковые настройки'); // Action 33
  const handleAction34 = () => console.log('Действие #34: Партнеры - предыдущий'); // Action 34

  const countries = [
    { name: 'Россия', flag: '🇷🇺', language: 'Русский' },
    { name: 'Израиль', flag: '🇮🇱', language: 'Иврит' },
    { name: 'США', flag: '🇺🇸', language: 'Английский' },
    { name: 'United Kingdom', flag: '🇬🇧', language: 'English' },
    { name: 'Canada', flag: '🇨🇦', language: 'English' },
    { name: 'Canada', flag: '🇨🇦', language: 'French' }
  ];

  const partners = [
    { name: 'Bank Leumi', logo: '/static/partners/bank-leumi.png' },
    { name: 'Bank Hapoalim', logo: '/static/partners/bank-hapoalim.png' },
    { name: 'Discount Bank', logo: '/static/partners/discount-bank.png' },
    { name: 'Bank of Israel', logo: '/static/partners/bank-israel.png' },
    { name: 'Massad Bank', logo: '/static/partners/massad-bank.png' }
  ];

  return (
    <div className="main-page">
      {/* Top Navigation */}
      <header className="top-navigation">
        <div className="nav-container">
          <div className="logo">
            <img src="/static/logo/bankimonline-logo.png" alt="BANKIMONLINE" />
          </div>
          
          <div className="nav-actions">
            {/* Country Selector - Action 32 */}
            <div className="country-selector" onClick={handleAction32}>
              <div className="selector-content">
                <div className="country-info">
                  <span className="flag">🇷🇺</span>
                  <div className="country-text">
                    <div className="country-label">Страна</div>
                    <div className="country-name">{currentLanguage}</div>
                  </div>
                </div>
                <ArrowRightIcon className="dropdown-arrow" />
              </div>
              
              {showCountryDropdown && (
                <div className="country-dropdown">
                  <div className="dropdown-header">Выберите Страну</div>
                  {countries.map((country, index) => (
                    <div key={index} className="country-option" onClick={handleAction33}>
                      <span className="flag">{country.flag}</span>
                      <div className="country-details">
                        <div className="country-name">{country.name}</div>
                        <div className="language">{country.language}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Login Button - Action 1 */}
            <button className="login-button" onClick={handleAction1}>
              <span>Войти в личный кабинет</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation - Action 2, 6 */}
      <nav className="side-navigation">
        <button className="menu-button" onClick={handleAction2}>
          <ListIcon />
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <div className="hero-text">
              <h1>СРАВНИТЕ ИПОТЕКИ</h1>
              <h2>Выберите ипотеку за 5 минут</h2>
              <p>Подберем для вас лучшие предложения на рынке</p>
            </div>
            <div className="hero-actions">
              {/* Action 5 - Fullscreen */}
              <button className="fullscreen-button" onClick={handleAction5}>
                <ArrowsOutSimpleIcon />
              </button>
              
              {/* Action 4 - Music Toggle */}
              <button 
                className={`music-button ${isMusicOn ? 'music-on' : 'music-off'}`}
                onClick={() => {
                  setIsMusicOn(!isMusicOn);
                  handleAction4();
                }}
              >
                <div className="speaker-icon">
                  {isMusicOn ? '🔊' : '🔇'}
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="feature-cards">
          {/* Action 7 - Mortgage Calculator */}
          <div className="feature-card" onClick={handleAction7}>
            <div className="card-content">
              <h3>Рассчитать<br />Ипотеку</h3>
              <div className="card-icon">
                <CalculatorIcon />
              </div>
            </div>
          </div>

          {/* Action 8 - Refinance Mortgage */}
          <div className="feature-card" onClick={handleAction8}>
            <div className="card-content">
              <h3>Рефинансировать<br />Ипотеку</h3>
              <div className="card-icon">
                <img src="/static/icons/house-up.png" alt="House Up" />
              </div>
            </div>
          </div>

          {/* Action 9 - Credit Calculator */}
          <div className="feature-card" onClick={handleAction9}>
            <div className="card-content">
              <h3>Рассчитать<br />Кредит</h3>
              <div className="card-icon">
                <img src="/static/icons/house-contract.png" alt="Contract" />
              </div>
            </div>
          </div>

          {/* Action 10 - Refinance Credit */}
          <div className="feature-card" onClick={handleAction10}>
            <div className="card-content">
              <h3>Рефинансировать<br />Кредит</h3>
              <div className="card-icon">
                <img src="/static/icons/loan.png" alt="Loan" />
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section">
          <h3>Банки партнеры</h3>
          <div className="partners-container">
            {/* Action 34 - Previous */}
            <button className="partner-nav prev" onClick={handleAction34}>
              <ArrowRightIcon className="rotated" />
            </button>
            
            <div className="partners-list">
              {partners.map((partner, index) => (
                <div key={index} className="partner-card">
                  <img src={partner.logo} alt={partner.name} />
                </div>
              ))}
            </div>
            
            {/* Action 11 - Next */}
            <button className="partner-nav next" onClick={handleAction11}>
              <ArrowRightIcon />
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <h2>Как это работает?</h2>
          <div className="steps-container">
            {/* Action 12 - Step 1 */}
            <div className="step-card" onClick={handleAction12}>
              <div className="step-icon">
                <CalculatorIcon />
              </div>
              <h3>Рассчитайте ипотеку<br />или кредит</h3>
              <p>Сделайте предварительный расчет, используя наш Калькулятор</p>
              <div className="step-number">1</div>
            </div>

            {/* Action 30 - Step 2 */}
            <div className="step-card" onClick={handleAction30}>
              <div className="step-icon">
                <ClipboardIcon />
              </div>
              <h3>Заполните анкету</h3>
              <p>Укажите данные о себе и своих доходах в нашей единой анкете</p>
              <div className="step-number">2</div>
            </div>

            {/* Action 31 - Step 3 */}
            <div className="step-card" onClick={handleAction31}>
              <div className="step-icon">
                <BankIcon />
              </div>
              <h3>Получите подходящие<br />программы</h3>
              <p>Мы подберем для вас программы с наилучшими условиями</p>
              <div className="step-number">3</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/static/logo/bankimonline-logo.png" alt="BANKIMONLINE" />
            <div className="social-icons">
              <button onClick={handleAction26}><InstagramIcon /></button>
              <button onClick={handleAction27}><YoutubeIcon /></button>
              <button onClick={handleAction28}><FacebookIcon /></button>
              <button onClick={handleAction29}><TwitterIcon /></button>
              <button onClick={handleAction21}><WhatsappIcon /></button>
            </div>
          </div>

          <div className="footer-sections">
            <div className="footer-section">
              <h4>Компания</h4>
              <ul>
                <li><a href="#" onClick={handleAction14}>Контакты</a></li>
                <li><a href="#" onClick={handleAction15}>О нас</a></li>
                <li><a href="#" onClick={handleAction16}>Вакансии</a></li>
                <li><a href="#" onClick={handleAction17}>Сотрудничетсво</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Контакты</h4>
              <ul>
                <li onClick={handleAction19}>
                  <EnvelopeIcon />
                  <span>info@bankimonline.com</span>
                </li>
                <li onClick={handleAction20}>
                  <PhoneIcon />
                  <span>+972 04-623-2280</span>
                </li>
                <li onClick={handleAction21}>
                  <WhatsappIcon />
                  <span>Напишите в администрацию</span>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Правовые документы</h4>
              <ul>
                <li><a href="#" onClick={handleAction22}>Пользовательское соглашение</a></li>
                <li><a href="#" onClick={handleAction23}>Политика конфиденциальности</a></li>
                <li><a href="#" onClick={handleAction24}>Использование файлов cookie</a></li>
                <li><a href="#" onClick={handleAction25}>Политика возврата оплаты</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>2023 Все права защищены Bankimonline Inc ©</p>
        </div>
      </footer>

      {/* Cookie Notification - Action 13, 18 */}
      {!cookiesAccepted && (
        <div className="cookie-notification">
          <div className="cookie-content">
            <div className="cookie-icon">
              <CookieIcon />
            </div>
            <div className="cookie-text">
              <p>
                Наш сайт обрабатывает Cookie для улучшения сервисов. 
                Оставаясь на сайте, вы соглашаетесь на использование файлов Cookie. 
                <a href="#" onClick={handleAction24}>Подробнее об использования файлов Cookie.</a>
              </p>
            </div>
            <div className="cookie-actions">
              <button 
                className="accept-button" 
                onClick={() => {
                  setCookiesAccepted(true);
                  handleAction13();
                }}
              >
                Принять куки
              </button>
              <button 
                className="close-button" 
                onClick={() => {
                  setCookiesAccepted(true);
                  handleAction18();
                }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage; 