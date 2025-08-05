-- Migration: Add Additional Vacancy Detail Columns
-- Date: 2025-07-06
-- Purpose: Add missing columns for comprehensive vacancy details

-- Add missing columns to vacancies table
ALTER TABLE vacancies 
ADD COLUMN IF NOT EXISTS responsibilities_he TEXT,
ADD COLUMN IF NOT EXISTS responsibilities_en TEXT,
ADD COLUMN IF NOT EXISTS responsibilities_ru TEXT,
ADD COLUMN IF NOT EXISTS nice_to_have_he TEXT,
ADD COLUMN IF NOT EXISTS nice_to_have_en TEXT,
ADD COLUMN IF NOT EXISTS nice_to_have_ru TEXT;

-- Update existing records with sample data
UPDATE vacancies 
SET 
    responsibilities_he = CASE 
        WHEN id = 1 THEN '- פיתוח וחיזוק API-ים ושירותי רקע
- עבודה עם בסיסי נתונים ואופטימיזציה של ביצועים
- אינטגרציה עם שירותי צד שלישי ומערכות תשלומים
- שיתוף פעולה עם צוותי Frontend ו-DevOps
- כתיבת קוד נקי ומתועד עם בדיקות יוניט
- השתתפות בסקירות קוד ותהליכי CI/CD'
        WHEN id = 2 THEN '- מחקר משתמשים ואנליזה של צרכים
- יצירת wireframes, mockups ו-prototypes
- עיצוב ממשקי משתמש עבור אפליקציות בנקאיות
- שיתוף פעולה עם צוותי פיתוח ומוצר
- ביצוע בדיקות משתמש ואיטרציה על העיצובים
- שמירה על consistency בחוויית המשתמש'
        WHEN id = 3 THEN '- פיתוח ממשקי משתמש עבור אפליקציות בנקאיות
- אימפלמנטציה של עיצובים ו-UI/UX
- אופטימיזציה של ביצועים והרפונסיביות
- שיתוף פעולה עם צוות הבק-אנד לאינטגרציה
- כתיבת קוד נקי ומתועד עם בדיקות
- השתתפות בסקירות קוד ותהליכי פיתוח'
        ELSE NULL
    END,
    responsibilities_en = CASE 
        WHEN id = 1 THEN '- Develop and maintain APIs and backend services
- Work with databases and optimize performance
- Integrate with third-party services and payment systems
- Collaborate with Frontend and DevOps teams
- Write clean, documented code with unit tests
- Participate in code reviews and CI/CD processes'
        WHEN id = 2 THEN '- User research and needs analysis
- Create wireframes, mockups and prototypes
- Design user interfaces for banking applications
- Collaborate with development and product teams
- Conduct user testing and iterate on designs
- Maintain consistency in user experience'
        WHEN id = 3 THEN '- Develop user interfaces for banking applications
- Implement designs and UI/UX
- Optimize performance and responsiveness
- Collaborate with backend team for integration
- Write clean, documented code with tests
- Participate in code reviews and development processes'
        ELSE NULL
    END,
    responsibilities_ru = CASE 
        WHEN id = 1 THEN '- Разработка и поддержка API и backend сервисов
- Работа с базами данных и оптимизация производительности
- Интеграция с внешними сервисами и платежными системами
- Сотрудничество с Frontend и DevOps командами
- Написание чистого, документированного кода с unit-тестами
- Участие в код-ревью и CI/CD процессах'
        WHEN id = 2 THEN '- Исследование пользователей и анализ потребностей
- Создание wireframes, mockups и прототипов
- Дизайн пользовательских интерфейсов для банковских приложений
- Сотрудничество с командами разработки и продукта
- Проведение пользовательского тестирования и итерация дизайнов
- Поддержание консистентности в пользовательском опыте'
        WHEN id = 3 THEN '- Разработка пользовательских интерфейсов для банковских приложений
- Реализация дизайнов и UI/UX
- Оптимизация производительности и отзывчивости
- Сотрудничество с backend командой для интеграции
- Написание чистого, документированного кода с тестами
- Участие в код-ревью и процессах разработки'
        ELSE NULL
    END,
    nice_to_have_he = CASE 
        WHEN id = 1 THEN '- ניסיון עם Docker ו-Kubernetes
- הכרות עם AWS או Azure cloud platforms
- ניסיון עם microservices architecture
- הכרות עם GraphQL
- ניסיון עם Redis ו-caching strategies
- הכרות עם אבטחת מידע ו-OWASP principles'
        WHEN id = 2 THEN '- ניסיון עם design systems
- הכרות עם animation ו-micro-interactions
- ניסיון עם accessibility standards
- הכרות עם HTML/CSS/JavaScript
- ניסיון עם user research tools
- הכרות עם agile/scrum methodologies'
        WHEN id = 3 THEN '- ניסיון עם Next.js או מסגרות React מתקדמות
- הכרות עם state management (Redux, Zustand)
- ניסיון עם testing frameworks (Jest, Cypress)
- הכרות עם build tools (Webpack, Vite)
- ניסיון עם progressive web apps (PWA)
- הכרות עם web performance optimization'
        ELSE NULL
    END,
    nice_to_have_en = CASE 
        WHEN id = 1 THEN '- Experience with Docker and Kubernetes
- Familiarity with AWS or Azure cloud platforms
- Experience with microservices architecture
- Knowledge of GraphQL
- Experience with Redis and caching strategies
- Knowledge of security and OWASP principles'
        WHEN id = 2 THEN '- Experience with design systems
- Knowledge of animation and micro-interactions
- Experience with accessibility standards
- Familiarity with HTML/CSS/JavaScript
- Experience with user research tools
- Knowledge of agile/scrum methodologies'
        WHEN id = 3 THEN '- Experience with Next.js or advanced React frameworks
- Knowledge of state management (Redux, Zustand)
- Experience with testing frameworks (Jest, Cypress)
- Familiarity with build tools (Webpack, Vite)
- Experience with progressive web apps (PWA)
- Knowledge of web performance optimization'
        ELSE NULL
    END,
    nice_to_have_ru = CASE 
        WHEN id = 1 THEN '- Опыт работы с Docker и Kubernetes
- Знание AWS или Azure cloud platforms
- Опыт работы с microservices architecture
- Знание GraphQL
- Опыт работы с Redis и caching strategies
- Знание безопасности и OWASP principles'
        WHEN id = 2 THEN '- Опыт работы с design systems
- Знание анимации и micro-interactions
- Опыт работы с accessibility standards
- Знание HTML/CSS/JavaScript
- Опыт работы с user research tools
- Знание agile/scrum методологий'
        WHEN id = 3 THEN '- Опыт работы с Next.js или продвинутыми React frameworks
- Знание state management (Redux, Zustand)
- Опыт работы с testing frameworks (Jest, Cypress)
- Знание build tools (Webpack, Vite)
- Опыт работы с progressive web apps (PWA)
- Знание web performance optimization'
        ELSE NULL
    END
WHERE id IN (1, 2, 3);

-- Add comments for documentation
COMMENT ON COLUMN vacancies.responsibilities_he IS 'Job responsibilities in Hebrew';
COMMENT ON COLUMN vacancies.responsibilities_en IS 'Job responsibilities in English';
COMMENT ON COLUMN vacancies.responsibilities_ru IS 'Job responsibilities in Russian';
COMMENT ON COLUMN vacancies.nice_to_have_he IS 'Nice to have requirements in Hebrew';
COMMENT ON COLUMN vacancies.nice_to_have_en IS 'Nice to have requirements in English';
COMMENT ON COLUMN vacancies.nice_to_have_ru IS 'Nice to have requirements in Russian'; 