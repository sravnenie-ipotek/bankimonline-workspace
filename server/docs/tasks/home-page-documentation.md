# **HOME PAGE DOCUMENTATION**
# **ДОКУМЕНТАЦИЯ ГЛАВНОЙ СТРАНИЦЫ**

## **1. Page Overview / Обзор страницы**

### **Page Name / Название страницы**
- **English**: Home Page / Главная страница
- **Russian**: Главная страница
- **Hebrew**: דף הבית

### **Route Path / Путь маршрута**
- **URL**: `http://localhost:5173/` (development)
- **Production**: `https://bankimonline.com/`
- **Route Definition**: `<Route path="/" element={<Home />} />`

### **Purpose / Назначение**
- **English**: Main landing page with video player, service navigation, and company information
- **Russian**: Главная страница с видеоплеером, навигацией по услугам и информацией о компании
- **Hebrew**: דף נחיתה ראשי עם נגן וידאו, ניווט שירותים ומידע על החברה

### **Target Audience / Целевая аудитория**
- **Primary**: Potential mortgage and credit customers
- **Secondary**: Business partners and investors
- **Internal**: Bank employees and administrators

### **Access Level / Уровень доступа**
- **Access**: Public (no authentication required)
- **Permissions**: Read-only for all users

---

## **2. Technology Stack / Технологический стек**

### **Frontend Framework / Фронтенд фреймворк**
- **Framework**: React 18+ with TypeScript
- **Language**: TypeScript (strict mode)
- **Component Type**: Functional Component with Hooks

### **State Management / Управление состоянием**
- **Global State**: Redux Toolkit (RTK)
- **Local State**: React useState hooks
- **State Persistence**: localStorage for user data

### **Styling / Стилизация**
- **CSS Framework**: SCSS modules with classnames/bind
- **Responsive Design**: Mobile-first approach
- **Layout**: Flexbox and CSS Grid

### **Routing / Маршрутизация**
- **Router**: React Router v6
- **Lazy Loading**: Suspense with lazy imports
- **Route Protection**: None (public page)

### **Content Management / Управление контентом**
- **System**: Database-first content system
- **Hook**: useContentApi with fallback strategy
- **Content Key**: 'home_page'
- **Fallback**: Cache → Database → File system

### **Internationalization / Интернационализация**
- **Library**: react-i18next
- **Languages**: English, Russian, Hebrew
- **Direction**: LTR/RTL support

### **UI Components / UI компоненты**
- **Custom Components**: VideoPoster, TopServices, PartnersSwiper, HowItWorks
- **Layout Components**: Container, Header, Footer
- **Modal Components**: CookiePolicyModal, AuthModal

### **Testing / Тестирование**
- **E2E Tests**: Cypress
- **Test Files**: `cypress/e2e/home.cy.ts`
- **Coverage**: 34 user actions documented

---

## **3. Key Dependencies & Imports / Ключевые зависимости и импорты**

```typescript
// Core React and TypeScript
import React, { useState } from 'react'
import classNames from 'classnames/bind'

// Database-first content system
import { useContentApi } from '@src/hooks/useContentApi'

// Redux state management
import { useAppDispatch } from '@src/hooks/store'
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'

// UI Components
import VideoPoster from '@src/components/ui/VideoPoster/VideoPoster'
import TopServices from '@src/components/ui/TopServices/TopServices'
import { PartnersSwiper } from '@src/components/ui/Swiper'
import HowItWorks from '@src/components/ui/HowItWorks'
import SkipCookie from '@src/components/ui/SkipCookie/SkipCookie.tsx'
import CookiePolicyModal from '@src/components/ui/CookiePolicyModal/CookiePolicyModal'
import { Container } from '@src/components/ui/Container'

// Styling
import styles from './home.module.scss'
```

---

## **4. Database-First Content System Integration / Интеграция системы контента**

### **Content Key / Ключ контента**
- **Primary Key**: `'home_page'`
- **Language**: Dynamic based on i18n.language
- **API Endpoint**: `/api/content/home_page/{language}`

### **Content Structure / Структура контента**
```typescript
// Content items from database
{
  "title_compare": "Compare mortgage offers",
  "compare_in_5minutes": "Compare in 5 minutes",
  "show_offers": "Show offers",
  // ... other content keys
}
```

### **Fallback Strategy / Стратегия резервного копирования**
1. **Cache**: Browser cache for performance
2. **Database**: MySQL content table
3. **File System**: Translation JSON files
4. **Default**: Hardcoded fallback values

### **Loading States / Состояния загрузки**
- **Loading**: Content API request in progress
- **Error**: Fallback to translation system
- **Success**: Display database content
- **Empty**: Show default content

---

## **5. State Management / Управление состоянием**

### **Redux Slices / Redux слайсы**
```typescript
// Login slice for authentication
import { setActiveModal } from '@src/pages/Services/slices/loginSlice'

// Modal slice for UI state
import { openAuthModal } from '@src/pages/Services/slices/modalSlice'
```

### **Local State / Локальное состояние**
```typescript
// Cookie policy modal state
const [isCookiePolicyModalOpen, setIsCookiePolicyModalOpen] = useState(false)

// Content API state
const { getContent, loading, error } = useContentApi('home_page')
```

### **Global State / Глобальное состояние**
- **User Data**: Stored in localStorage and Redux
- **Language Settings**: i18n language state
- **Modal States**: Auth modal, cookie modal
- **Window Size**: Responsive breakpoints

---

## **6. User Actions & Interactions / Действия и взаимодействия пользователя**

### **Action Count / Количество действий**
- **Total Actions**: 34 documented user actions
- **Primary Actions**: 10 main service interactions
- **Navigation Actions**: 8 menu and navigation
- **Media Actions**: 2 video player controls
- **Footer Actions**: 14 footer interactions

### **Key Interactions / Ключевые взаимодействия**

#### **Video Player Actions / Действия видеоплеера**
```typescript
// Action #4: Toggle music/sound
const handleAction4_ToggleMusic = () => {
  console.log('OS-94 Действие #4: Включить/выключить звук')
}

// Action #5: Fullscreen mode
const handleAction5_Fullscreen = () => {
  console.log('OS-94 Действие #5: Полноэкранный режим')
}
```

#### **Service Navigation / Навигация по услугам**
```typescript
// Action #7: Calculate mortgage
const handleAction7_MortgageCalc = () => {
  console.log('OS-94 Действие #7: Рассчитать ипотеку')
}

// Action #8: Refinance mortgage
const handleAction8_RefinanceMortgage = () => {
  console.log('OS-94 Действие #8: Рефинансирование ипотеки')
}
```

### **Event Handlers / Обработчики событий**
- **Video Controls**: Music toggle, fullscreen mode
- **Service Buttons**: Mortgage, credit, refinancing
- **Partner Navigation**: Next/previous partner swiper
- **How It Works**: Step-by-step navigation
- **Cookie Management**: Accept, close, info

### **Navigation / Навигация**
- **From**: Direct URL access, redirects
- **To**: Service pages, partner pages, legal pages
- **Internal**: Modal dialogs, side navigation

---

## **7. Component Architecture / Архитектура компонентов**

### **Main Component / Основной компонент**
```typescript
const Home: React.FC = () => {
  // Component implementation
  return (
    <div className={cx('home')}>
      <Container>
        <VideoPoster />
      </Container>
      <TopServices />
      <PartnersSwiper />
      <HowItWorks />
    </div>
  )
}
```

### **Child Components / Дочерние компоненты**
- **VideoPoster**: Video player with controls
- **TopServices**: Service navigation buttons
- **PartnersSwiper**: Partner carousel
- **HowItWorks**: Step-by-step guide
- **SkipCookie**: Cookie consent banner
- **CookiePolicyModal**: Cookie policy dialog

### **Layout Components / Компоненты макета**
- **Container**: Responsive container wrapper
- **Header**: Navigation and language controls
- **Footer**: Company links and social media

### **Modal Components / Модальные компоненты**
- **CookiePolicyModal**: Cookie policy information
- **AuthModal**: Authentication dialog (connected)

---

## **8. Styling & Responsive Design / Стилизация и адаптивный дизайн**

### **SCSS Module / SCSS модуль**
```scss
// home.module.scss
.home {
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-top: 1rem;
}
```

### **Responsive Breakpoints / Адаптивные точки останова**
- **Mobile**: < 768px
- **Tablet**: 768px - 1280px
- **Desktop**: > 1280px

### **Theme Integration / Интеграция темы**
- **Light Mode**: Default theme
- **Dark Mode**: Not implemented
- **Color Scheme**: Brand colors (blue, white)

### **Animation / Анимация**
- **Video Transitions**: Smooth video player transitions
- **Modal Animations**: Fade in/out for modals
- **Hover Effects**: Button and link hover states

---

## **9. Error Handling & Edge Cases / Обработка ошибок и граничные случаи**

### **Error Boundaries / Границы ошибок**
- **Content API Errors**: Fallback to translation system
- **Video Loading Errors**: Poster image fallback
- **Component Errors**: Error boundary wrapper

### **Loading States / Состояния загрузки**
- **Content Loading**: Loading indicator for API calls
- **Video Loading**: Poster image while video loads
- **Component Loading**: Suspense boundaries

### **Empty States / Пустые состояния**
- **No Content**: Default text fallbacks
- **No Partners**: Empty partner carousel
- **No Services**: Default service buttons

### **Validation / Валидация**
- **Content Validation**: API response validation
- **User Input**: No direct user input on home page
- **URL Validation**: Route parameter validation

---

## **10. Testing Strategy / Стратегия тестирования**

### **Cypress Tests / Cypress тесты**
```typescript
// cypress/e2e/home.cy.ts
describe('Home Page', () => {
  it('should load home page with video player', () => {
    cy.visit('/')
    cy.get('[data-testid="video-poster"]').should('be.visible')
  })
  
  it('should handle video player controls', () => {
    cy.get('[data-testid="music-toggle"]').click()
    cy.get('[data-testid="fullscreen-button"]').click()
  })
})
```

### **Unit Tests / Модульные тесты**
- **Component Testing**: React Testing Library
- **Hook Testing**: useContentApi hook tests
- **Action Testing**: Redux action tests

### **Integration Tests / Интеграционные тесты**
- **API Integration**: Content API endpoint tests
- **Redux Integration**: State management tests
- **i18n Integration**: Translation system tests

### **Accessibility / Доступность**
- **ARIA Labels**: Video player controls
- **Keyboard Navigation**: Tab order and focus
- **Screen Reader**: Alt text for images

---

## **11. Performance Considerations / Соображения производительности**

### **Code Splitting / Разделение кода**
```typescript
// Lazy loading for child components
const VideoPoster = lazy(() => import('@src/components/ui/VideoPoster/VideoPoster'))
const TopServices = lazy(() => import('@src/components/ui/TopServices/TopServices'))
```

### **Bundle Size / Размер бандла**
- **Home Component**: ~15KB (minified)
- **Video Assets**: ~5MB (compressed)
- **Dependencies**: Shared with other pages

### **Caching / Кэширование**
- **Content Cache**: Browser cache for API responses
- **Video Cache**: Browser video cache
- **Component Cache**: React component memoization

### **Optimization / Оптимизация**
- **Video Compression**: WebM and MP4 formats
- **Image Optimization**: WebP and PNG formats
- **Lazy Loading**: Component and asset lazy loading

---

## **12. Internationalization (i18n) / Интернационализация**

### **Translation Keys / Ключи перевода**
```json
{
  "title_compare": "Compare mortgage offers",
  "compare_in_5minutes": "Compare in 5 minutes",
  "show_offers": "Show offers"
}
```

### **Language Support / Поддержка языков**
- **English**: Default language
- **Russian**: Полная поддержка
- **Hebrew**: RTL support with full translation

### **RTL Support / Поддержка RTL**
- **Hebrew Layout**: Right-to-left text direction
- **Component Adaptation**: RTL-aware components
- **CSS Direction**: `direction: rtl` for Hebrew

### **Cultural Considerations / Культурные особенности**
- **Date Formats**: Localized date display
- **Number Formats**: Localized number formatting
- **Currency**: Local currency display

---

## **13. Integration Points / Точки интеграции**

### **API Endpoints / API конечные точки**
```typescript
// Content API
GET /api/content/home_page/{language}

// User data API
GET /api/user/data
POST /api/user/login
```

### **External Services / Внешние сервисы**
- **Video Hosting**: Local video files
- **Analytics**: Google Analytics integration
- **Social Media**: Direct links to social platforms

### **Analytics / Аналитика**
- **Page Views**: Home page visit tracking
- **Video Interactions**: Video player engagement
- **Service Clicks**: Service button click tracking

### **SEO / SEO**
- **Meta Tags**: Dynamic meta tag generation
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: XML sitemap inclusion

---

## **14. Development Notes / Заметки разработчика**

### **Known Issues / Известные проблемы**
- **Video Autoplay**: Browser autoplay restrictions
- **Content Loading**: Race conditions with i18n
- **Mobile Performance**: Video optimization needed

### **Technical Debt / Технический долг**
- **Component Refactoring**: Extract action handlers
- **Type Safety**: Improve TypeScript types
- **Error Handling**: Enhance error boundaries

### **Future Enhancements / Будущие улучшения**
- **Video Optimization**: Adaptive bitrate streaming
- **Content Management**: Admin interface for content
- **Performance**: Service worker implementation

### **Migration Notes / Заметки миграции**
- **Database-First**: Phase 12 migration complete
- **Content API**: Fully integrated
- **Translation System**: Fallback mechanism active

---

## **15. Code Examples / Примеры кода**

### **Content API Usage / Использование Content API**
```typescript
const { getContent, loading, error } = useContentApi('home_page')

// Get content with fallback
const title = getContent('title_compare', 'title_compare')
const subtitle = getContent('compare_in_5minutes', 'compare_in_5minutes')
```

### **State Management / Управление состоянием**
```typescript
// Redux dispatch
const dispatch = useAppDispatch()
dispatch(openAuthModal())
dispatch(setActiveModal('phoneVerification'))

// Local state
const [isCookiePolicyModalOpen, setIsCookiePolicyModalOpen] = useState(false)
```

### **Event Handlers / Обработчики событий**
```typescript
// Video player actions
const handleAction4_ToggleMusic = () => {
  console.log('OS-94 Действие #4: Включить/выключить звук')
}

const handleAction5_Fullscreen = () => {
  console.log('OS-94 Действие #5: Полноэкранный режим')
  setIsPlayerOpen(true)
}
```

### **Component Structure / Структура компонента**
```typescript
const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const { getContent, loading, error } = useContentApi('home_page')
  const [isCookiePolicyModalOpen, setIsCookiePolicyModalOpen] = useState(false)

  return (
    <>
      <div className={cx('home')}>
        <Container>
          <VideoPoster
            title={getContent('title_compare', 'title_compare')}
            subtitle={getContent('compare_in_5minutes', 'compare_in_5minutes')}
            text={getContent('show_offers', 'show_offers')}
            onMusicToggle={handleAction4_ToggleMusic}
            onFullscreen={handleAction5_Fullscreen}
          />
        </Container>
        <TopServices />
        <PartnersSwiper />
        <HowItWorks />
      </div>
      <SkipCookie />
      <CookiePolicyModal />
    </>
  )
}
```

---

## **Video Player Implementation / Реализация видеоплеера**

### **VideoPoster Component / Компонент VideoPoster**
```typescript
// Video player with controls
<VideoPoster
  title={getContent('title_compare', 'title_compare')}
  subtitle={getContent('compare_in_5minutes', 'compare_in_5minutes')}
  text={getContent('show_offers', 'show_offers')}
  onMusicToggle={handleAction4_ToggleMusic}
  onFullscreen={handleAction5_Fullscreen}
/>
```

### **Video Features / Особенности видео**
- **Autoplay**: Video starts automatically
- **Loop**: Video loops continuously
- **Muted**: Audio starts muted
- **Poster**: Background image while loading
- **Controls**: Music toggle and fullscreen

### **Video Assets / Видео ресурсы**
- **Video File**: `/static/promo.mp4`
- **WebM Format**: `/static/promo.webm`
- **Audio File**: `/static/promo.mp3`
- **Poster Image**: `/static/Background.png`

### **Video Controls / Управление видео**
- **Music Toggle**: Speaker on/off icon
- **Fullscreen**: Arrows out icon
- **Mobile Optimization**: Responsive controls
- **Accessibility**: ARIA labels for controls

---

**Documentation Version**: 1.0  
**Last Updated**: 2025-08-06  
**Migration Status**: Phase 12 Complete  
**Video Player**: Fully Implemented 