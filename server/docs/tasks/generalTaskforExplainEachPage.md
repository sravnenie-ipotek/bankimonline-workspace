# **GENERAL TASK: CREATE PAGE DOCUMENTATION**
# **ОБЩАЯ ЗАДАЧА: СОЗДАТЬ ДОКУМЕНТАЦИЮ СТРАНИЦ**

## **Objective / Цель**
Create comprehensive developer documentation for each page in the BankimOnline application, covering technologies, references, logical explanations, and implementation details.

Создать комплексную документацию для разработчиков для каждой страницы приложения BankimOnline, охватывающую технологии, ссылки, логические объяснения и детали реализации.

## **Scope / Область применения**
Document all pages identified in the routing structure, including:

Документировать все страницы, определенные в структуре маршрутизации, включая:

- **Main Pages / Основные страницы**: Home, About, Contacts, Cooperation, Services, etc.
- **Service Pages / Страницы услуг**: CalculateMortgage, CalculateCredit, RefinanceMortgage, RefinanceCredit
- **Bank Pages / Страницы банков**: Apoalim, Discount, Leumi, Beinleumi
- **Special Pages / Специальные страницы**: Registration, AuthModal, Admin, PersonalCabinet, etc.
- **Legal Pages / Правовые страницы**: PrivacyPolicy, Terms, Cookie, Refund
- **Business Pages / Бизнес-страницы**: TendersForBrokers, TendersForLawyers, Vacancies, etc.

## **Documentation Structure for Each Page / Структура документации для каждой страницы**

### **1. Page Overview / Обзор страницы**
- **Page Name / Название страницы**: [Page Name / Название страницы]
- **Route Path / Путь маршрута**: [URL path / URL путь]
- **Purpose / Назначение**: [Business purpose and user journey / Бизнес-цель и пользовательский путь]
- **Target Audience / Целевая аудитория**: [End users, internal users, etc. / Конечные пользователи, внутренние пользователи и т.д.]
- **Access Level / Уровень доступа**: [Public, Authenticated, Admin, etc. / Публичный, Аутентифицированный, Админ и т.д.]

### **2. Technology Stack / Технологический стек**
- **Frontend Framework / Фронтенд фреймворк**: React 18+ with TypeScript
- **State Management / Управление состоянием**: Redux Toolkit (RTK)
- **Styling / Стилизация**: SCSS modules with classnames/bind
- **Routing / Маршрутизация**: React Router v6
- **Content Management / Управление контентом**: Database-first content system with useContentApi hook
- **Internationalization / Интернационализация**: react-i18next (if applicable)
- **UI Components / UI компоненты**: Custom component library
- **Testing / Тестирование**: Cypress E2E tests

### **3. Key Dependencies & Imports / Ключевые зависимости и импорты**
```typescript
// List all critical imports and their purposes
// Перечислить все критические импорты и их назначение
import { useContentApi } from '@src/hooks/useContentApi'
import { useAppDispatch, useAppSelector } from '@src/hooks/store'
// ... other imports / ... другие импорты
```

### **4. Database-First Content System Integration / Интеграция системы контента**
- **Content Key / Ключ контента**: [e.g., 'home_page', 'about_page' / например, 'home_page', 'about_page']
- **Content Structure / Структура контента**: [Describe the content structure from database / Описать структуру контента из базы данных]
- **Fallback Strategy / Стратегия резервного копирования**: Cache → Database → File system
- **Loading States / Состояния загрузки**: [How loading/error states are handled / Как обрабатываются состояния загрузки/ошибок]

### **5. State Management / Управление состоянием**
- **Redux Slices / Redux слайсы**: [List relevant slices / Перечислить соответствующие слайсы]
- **Local State / Локальное состояние**: [useState hooks and their purposes / useState хуки и их назначение]
- **Global State / Глобальное состояние**: [Redux selectors and actions used / Используемые Redux селекторы и действия]

### **6. User Actions & Interactions / Действия и взаимодействия пользователя**
- **Action Count / Количество действий**: [Total number of user actions / Общее количество действий пользователя]
- **Key Interactions / Ключевые взаимодействия**: [List main user interactions / Перечислить основные взаимодействия пользователя]
- **Event Handlers / Обработчики событий**: [Important event handlers and their purposes / Важные обработчики событий и их назначение]
- **Navigation / Навигация**: [How users navigate to/from this page / Как пользователи переходят на/с этой страницы]

### **7. Component Architecture / Архитектура компонентов**
- **Main Component / Основной компонент**: [Primary component structure / Структура основного компонента]
- **Child Components / Дочерние компоненты**: [List of imported components / Список импортированных компонентов]
- **Layout Components / Компоненты макета**: [Header, Footer, Sidebar integration / Интеграция Header, Footer, Sidebar]
- **Modal Components / Модальные компоненты**: [Any modal dialogs / Любые модальные диалоги]

### **8. Styling & Responsive Design / Стилизация и адаптивный дизайн**
- **SCSS Module / SCSS модуль**: [Main style file / Основной файл стилей]
- **Responsive Breakpoints / Адаптивные точки останова**: [Mobile, tablet, desktop / Мобильный, планшет, десктоп]
- **Theme Integration / Интеграция темы**: [Dark/light mode if applicable / Темная/светлая тема если применимо]
- **Animation / Анимация**: [Any animations or transitions / Любые анимации или переходы]

### **9. Error Handling & Edge Cases / Обработка ошибок и граничные случаи**
- **Error Boundaries / Границы ошибок**: [Error handling strategy / Стратегия обработки ошибок]
- **Loading States / Состояния загрузки**: [Loading indicators and skeleton screens / Индикаторы загрузки и скелетные экраны]
- **Empty States / Пустые состояния**: [How empty data is handled / Как обрабатываются пустые данные]
- **Validation / Валидация**: [Form validation if applicable / Валидация форм если применимо]

### **10. Testing Strategy / Стратегия тестирования**
- **Cypress Tests / Cypress тесты**: [E2E test files and scenarios / E2E тестовые файлы и сценарии]
- **Unit Tests / Модульные тесты**: [Component testing if applicable / Тестирование компонентов если применимо]
- **Integration Tests / Интеграционные тесты**: [API integration testing / Тестирование интеграции API]
- **Accessibility / Доступность**: [A11y considerations / Соображения доступности]

### **11. Performance Considerations / Соображения производительности**
- **Code Splitting / Разделение кода**: [Lazy loading implementation / Реализация ленивой загрузки]
- **Bundle Size / Размер бандла**: [Component size impact / Влияние размера компонента]
- **Caching / Кэширование**: [Content caching strategy / Стратегия кэширования контента]
- **Optimization / Оптимизация**: [Performance optimizations / Оптимизация производительности]

### **12. Internationalization (i18n) / Интернационализация**
- **Translation Keys / Ключи перевода**: [Key translation files / Ключевые файлы перевода]
- **Language Support / Поддержка языков**: [Supported languages / Поддерживаемые языки]
- **RTL Support / Поддержка RTL**: [Right-to-left language handling / Обработка языков справа налево]
- **Cultural Considerations / Культурные особенности**: [Localization details / Детали локализации]

### **13. Integration Points / Точки интеграции**
- **API Endpoints / API конечные точки**: [Backend API calls / Вызовы backend API]
- **External Services / Внешние сервисы**: [Third-party integrations / Интеграции сторонних сервисов]
- **Analytics / Аналитика**: [Tracking and monitoring / Отслеживание и мониторинг]
- **SEO / SEO**: [Search engine optimization / Оптимизация поисковых систем]

### **14. Development Notes / Заметки разработчика**
- **Known Issues / Известные проблемы**: [Current bugs or limitations / Текущие ошибки или ограничения]
- **Technical Debt / Технический долг**: [Areas for improvement / Области для улучшения]
- **Future Enhancements / Будущие улучшения**: [Planned features / Планируемые функции]
- **Migration Notes / Заметки миграции**: [Database-first migration status / Статус миграции database-first]

### **15. Code Examples / Примеры кода**
```typescript
// Key code snippets showing:
// Ключевые фрагменты кода, показывающие:
// - Content API usage / Использование Content API
// - State management / Управление состоянием
// - Event handlers / Обработчики событий
// - Component structure / Структура компонента
```

## **Documentation Format / Формат документации**
Create individual `.md` files for each page in a `docs/pages/` directory with the following naming convention:

Создать отдельные файлы `.md` для каждой страницы в директории `docs/pages/` со следующей конвенцией именования:

- `home-page.md`
- `about-page.md`
- `contacts-page.md`
- etc. / и т.д.

## **Quality Standards / Стандарты качества**
- **Completeness / Полнота**: All sections must be filled / Все разделы должны быть заполнены
- **Accuracy / Точность**: Code examples must match actual implementation / Примеры кода должны соответствовать фактической реализации
- **Clarity / Ясность**: Use clear, developer-friendly language / Использовать ясный, удобный для разработчиков язык
- **Consistency / Последовательность**: Follow the same structure across all pages / Следовать одной структуре на всех страницах
- **Maintainability / Поддерживаемость**: Easy to update as code changes / Легко обновлять при изменении кода

## **Deliverables / Результаты**
1. **Individual page documentation files / Отдельные файлы документации страниц** (`.md` format / формат `.md`)
2. **Page documentation index / Индекс документации страниц** (master list with links / основной список со ссылками)
3. **Architecture overview / Обзор архитектуры** (how pages relate to each other / как страницы соотносятся друг с другом)
4. **Development workflow guide / Руководство по рабочему процессу разработки** (how to use this documentation / как использовать эту документацию)

---

This general task description provides a comprehensive framework for documenting each page in your application. Each page will have its own detailed markdown file covering all the aspects mentioned above, making it easy for developers to understand the technology stack, implementation details, and maintenance requirements for any given page.

Это общее описание задачи предоставляет комплексную основу для документирования каждой страницы в вашем приложении. Каждая страница будет иметь свой собственный подробный markdown файл, охватывающий все упомянутые выше аспекты, что упрощает разработчикам понимание технологического стека, деталей реализации и требований к обслуживанию для любой заданной страницы.
