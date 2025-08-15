const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Jira integration functions (copied from cypress.config.ts)
function jiraClient() {
  const baseURL = process.env.JIRA_HOST;
  const auth = Buffer.from(
    `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
  ).toString('base64');

  const api = axios.create({
    baseURL,
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  async function createIssue({ projectKey, summary, description, issueType, labels }) {
    const payload = {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType || 'Баг' },
        labels: labels || [],
      },
    };
    const res = await api.post('/rest/api/3/issue', payload);
    return res.data.key;
  }

  return { createIssue };
}

/** Create a short, stable fingerprint for the failure */
function buildFingerprint({ projectKey, spec, testTitle, errorMessage }) {
  const raw = `${projectKey}::${spec}::${testTitle}::${(errorMessage || '').slice(0,400)}`;
  return 'cfp_' + crypto.createHash('sha1').update(raw).digest('hex').slice(0, 10);
}

// Simulate a realistic Cypress test failure
async function createDemoJiraBug() {
  console.log('🚀 Starting Demo Jira Bug Creation...');
  
  const projectKey = process.env.JIRA_PROJECT_KEY || 'TVKC';
  const issueType = process.env.JIRA_ISSUE_TYPE || 'Баг';
  
  // Simulated test failure data
  const testData = {
    spec: 'cypress/e2e/mortgage/step2.cy.ts',
    testTitle: 'Mortgage Calculator Step 2 - Property Ownership Validation',
    errorMessage: 'AssertionError: expected property ownership dropdown to contain option "I don\'t own property" but got "undefined"',
    appUrl: 'http://localhost:5174',
    browser: 'Chrome 120.0.6099.129',
    os: 'darwin x64',
    currentUrl: 'http://localhost:5174/services/calculate-mortgage/2',
    filePath: 'cypress/e2e/mortgage/step2.cy.ts',
    actionLog: [
      '[2024-08-15T11:52:30.000Z] Test started: Mortgage Calculator Step 2',
      '[2024-08-15T11:52:30.300Z] visit: ["/services/calculate-mortgage/2"]',
      '[2024-08-15T11:52:31.000Z] get: ["[data-testid=\\"property-ownership-dropdown\\"]"]',
      '[2024-08-15T11:52:31.400Z] should: ["be.visible"]',
      '[2024-08-15T11:52:31.800Z] get: ["[data-testid=\\"property-ownership-dropdown\\"] option"]',
      '[2024-08-15T11:52:32.200Z] should: ["contain.text","I don\'t own property"]',
      '[2024-08-15T11:52:32.600Z] FAILED - should: AssertionError: expected option text',
      '[2024-08-15T11:52:33.000Z] URL changed to: /services/calculate-mortgage/2',
      '[2024-08-15T11:52:33.400Z] Test failed: Property ownership dropdown validation failed'
    ],
    testSteps: [
      { action: 'visit', args: ['/services/calculate-mortgage/2'], timestamp: '2024-08-15T11:52:30.300Z', success: true },
      { action: 'get', selector: '[data-testid="property-ownership-dropdown"]', timestamp: '2024-08-15T11:52:31.000Z', success: true },
      { action: 'should', args: ['be.visible'], timestamp: '2024-08-15T11:52:31.400Z', success: true },
      { action: 'get', selector: '[data-testid="property-ownership-dropdown"] option', timestamp: '2024-08-15T11:52:31.800Z', success: true },
      { action: 'should', args: ['contain.text', "I don't own property"], timestamp: '2024-08-15T11:52:32.200Z', success: false, error: 'AssertionError: expected option text' }
    ]
  };

  try {
    const client = jiraClient();
    const fingerprint = buildFingerprint({ projectKey, spec: testData.spec, testTitle: testData.testTitle, errorMessage: testData.errorMessage });
    const timestamp = new Date().toISOString();

    console.log(`📍 Creating bug with fingerprint: ${fingerprint}`);

    const summary = `🔥 КРИТИЧЕСКИЙ: Выпадающий список собственности не работает | CRITICAL: Property ownership dropdown not working`;
    
    // Create comprehensive bilingual ADF description with clear explanations
    const description = {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 1 },
          "content": [{ "type": "text", "text": "🚨 КРИТИЧЕСКИЙ БАГ В ИПОТЕЧНОМ КАЛЬКУЛЯТОРЕ | CRITICAL MORTGAGE CALCULATOR BUG" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "error" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ПРОБЛЕМА: Пользователи НЕ МОГУТ выбрать тип собственности в ипотечном калькуляторе. Выпадающий список не показывает варианты, блокируя весь процесс расчета ипотеки.", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 ISSUE: Users CANNOT select property ownership type in mortgage calculator. The dropdown does not show options, blocking the entire mortgage calculation process.", "marks": [{ "type": "strong" }] }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "👥 ВЛИЯНИЕ НА ПОЛЬЗОВАТЕЛЕЙ | USER IMPACT" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "warning" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 СЕРЬЕЗНОСТЬ: ВЫСОКАЯ - Клиенты не могут продолжить расчет ипотеки после 2-го шага", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Потеря клиентов из-за неработающего калькулятора" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Невозможность получить предварительные расчеты" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Снижение конверсии на сайте банка" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 SEVERITY: HIGH - Customers cannot proceed with mortgage calculation after step 2", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Customer loss due to broken calculator" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Unable to get preliminary calculations" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Reduced conversion on bank website" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "🔍 ЧТО ИМЕННО СЛОМАНО | WHAT EXACTLY IS BROKEN" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "info" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ТЕХНИЧЕСКАЯ СУТЬ:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "В выпадающем списке 'Тип собственности' отсутствуют обязательные варианты:" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'У меня нет недвижимости' (75% финансирование)", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'У меня есть недвижимость' (50% финансирование)", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'Продаю недвижимость' (70% финансирование)", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 TECHNICAL DETAILS:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "Property ownership dropdown is missing required options:" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'I don't own property' (75% financing)", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'I own property' (50% financing)", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'Selling property' (70% financing)", "marks": [{ "type": "code" }] }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "📋 КАК ВОСПРОИЗВЕСТИ ПРОБЛЕМУ | HOW TO REPRODUCE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "note" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ПОШАГОВАЯ ИНСТРУКЦИЯ:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Откройте ипотечный калькулятор: " },
                { "type": "text", "text": "http://localhost:5174/services/calculate-mortgage/2", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Найдите выпадающий список 'Тип собственности'" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Попробуйте выбрать любой вариант" },
                { "type": "hardBreak" },
                { "type": "text", "text": "4. ❌ РЕЗУЛЬТАТ: Варианты отсутствуют или показывают 'undefined'" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 STEP-BY-STEP INSTRUCTIONS:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Open mortgage calculator: " },
                { "type": "text", "text": "http://localhost:5174/services/calculate-mortgage/2", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Find the 'Property Ownership' dropdown" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Try to select any option" },
                { "type": "hardBreak" },
                { "type": "text", "text": "4. ❌ RESULT: Options are missing or show 'undefined'" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "📸 СКРИНШОТ ПРОБЛЕМЫ | SCREENSHOT OF ISSUE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "note" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ВИЗУАЛЬНОЕ ПОДТВЕРЖДЕНИЕ:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "Скриншот показывает:" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Пустой выпадающий список вместо вариантов собственности" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Кнопка 'Продолжить' заблокирована (неактивна)" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Ошибка в консоли браузера: 'dropdown options undefined'" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 VISUAL CONFIRMATION:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "Screenshot shows:" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Empty dropdown instead of property ownership options" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• 'Continue' button is disabled/inactive" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Browser console error: 'dropdown options undefined'" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "📸 В реальном тесте здесь был бы прикреплен скриншот | In real test, screenshot would be attached here", "marks": [{ "type": "em" }] }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "💡 БЫСТРОЕ РЕШЕНИЕ | QUICK FIX" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "success" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ДЛЯ РАЗРАБОТЧИКОВ:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Проверьте API endpoint: " },
                { "type": "text", "text": "/api/v1/calculation-parameters?business_path=mortgage", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Убедитесь что property_ownership_ltvs возвращает правильные данные" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Проверьте компонент: " },
                { "type": "text", "text": "PropertyOwnershipDropdown.tsx", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 FOR DEVELOPERS:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Check API endpoint: " },
                { "type": "text", "text": "/api/v1/calculation-parameters?business_path=mortgage", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Ensure property_ownership_ltvs returns correct data" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Check component: " },
                { "type": "text", "text": "PropertyOwnershipDropdown.tsx", "marks": [{ "type": "code" }] }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "📍 ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ | TECHNICAL INFORMATION" }]
        },
        {
          "type": "table",
          "attrs": {
            "isNumberColumnEnabled": false,
            "layout": "default"
          },
          "content": [
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableHeader",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Field | Поле" }] }]
                },
                {
                  "type": "tableHeader", 
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Value | Значение" }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Spec File | Файл спецификации" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testData.spec, "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Test Title | Название теста" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testData.testTitle, "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "File Path | Путь к файлу" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testData.filePath, "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Current URL | Текущий URL" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": testData.currentUrl, "marks": [{ "type": "code" }] }] }]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🖥️ Environment | Окружение" }]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Browser | Браузер: " + testData.browser }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Operating System | Операционная система: " + testData.os }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Timestamp | Время: " + timestamp }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "❌ ДЕТАЛИ ОШИБКИ | ERROR DETAILS" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "error" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ТЕХНИЧЕСКАЯ ОШИБКА:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "Автоматический тест ожидал найти текст 'У меня нет недвижимости' в выпадающем списке, но вместо этого нашел 'undefined'. Это означает, что данные не загружаются с сервера или компонент не может их обработать." },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 TECHNICAL ERROR:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "Automated test expected to find text 'I don't own property' in dropdown but found 'undefined' instead. This means data is not loading from server or component cannot process it." }
              ]
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": { "language": "javascript" },
          "content": [{ "type": "text", "text": "CYPRESS TEST ERROR:\n" + testData.errorMessage + "\n\nLOCATION: cypress/e2e/mortgage/step2.cy.ts:45\nELEMENT: [data-testid='property-ownership-dropdown'] option\nEXPECTED: 'I don\\'t own property'\nACTUAL: 'undefined'" }]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "📋 Test Steps | Шаги теста" }]
        },
        {
          "type": "orderedList",
          "content": testData.testSteps.map((step, index) => ({
            "type": "listItem",
            "content": [
              {
                "type": "paragraph",
                "content": [
                  { "type": "text", "text": `${step.action}`, "marks": step.success === false ? [{ "type": "strong" }, { "type": "textColor", "attrs": { "color": "#DE350B" } }] : [] },
                  step.selector ? { "type": "text", "text": ` (${step.selector})`, "marks": [{ "type": "code" }] } : null,
                  step.args ? { "type": "text", "text": ` args: ${JSON.stringify(step.args)}`, "marks": [{ "type": "code" }] } : null
                ].filter(Boolean)
              }
            ]
          }))
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🔍 Action Log | Журнал действий" }]
        },
        {
          "type": "codeBlock",
          "attrs": { "language": "text" },
          "content": [{ "type": "text", "text": testData.actionLog.join('\n') }]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🔧 Debug Information | Отладочная информация" }]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Fingerprint | Отпечаток: " },
                    { "type": "text", "text": fingerprint, "marks": [{ "type": "code" }] }
                  ]
                }
              ]
            },
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Screenshots attached | Прикреплены скриншоты: Would be attached in real test | Были бы прикреплены в реальном тесте" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "info" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🔧 ВАЖНО ДЛЯ КОМАНДЫ | IMPORTANT FOR TEAM", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇷🇺 Это ДЕМОНСТРАЦИОННЫЙ баг, созданный автоматически системой Cypress для показа возможностей интеграции с Jira. В реальных сбоях тестов:", "marks": [{ "type": "em" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Автоматически прикрепляются скриншоты высокого разрешения" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Добавляются видеозаписи выполнения теста" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Сохраняются логи консоли браузера" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Создается уникальный отпечаток для предотвращения дублей" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 This is a DEMO bug created automatically by Cypress system to showcase Jira integration capabilities. In real test failures:", "marks": [{ "type": "em" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• High-resolution screenshots are automatically attached" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Test execution videos are included" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Browser console logs are saved" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Unique fingerprint prevents duplicate bugs" }
              ]
            }
          ]
        }
      ]
    };

    const labels = [fingerprint, 'cypress', 'auto-filed', 'demo', 'mortgage-calculator', 'bilingual'];
    
    console.log('🎯 Creating Jira issue...');
    const issueKey = await client.createIssue({
      projectKey,
      summary,
      description,
      issueType,
      labels,
    });

    console.log(`✅ SUCCESS! Jira bug created: https://bankimonline.atlassian.net/browse/${issueKey}`);
    console.log(`📍 Bug details: https://bankimonline.atlassian.net/browse/${issueKey}`);
    console.log(`🔧 Fingerprint: ${fingerprint}`);
    
    return { issueKey, fingerprint };
  } catch (error) {
    console.error('❌ Jira integration error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return { error: error.message };
  }
}

// Run the demo
createDemoJiraBug().then(result => {
  if (result.issueKey) {
    console.log('\n🎉 Demo completed successfully!');
    console.log('🔗 View the created bug:', `https://bankimonline.atlassian.net/browse/${result.issueKey}`);
    console.log('\nThe bug includes:');
    console.log('✅ Exact file path: cypress/e2e/mortgage/step2.cy.ts');
    console.log('✅ Complete action log with timestamps');
    console.log('✅ Structured test steps with success/failure status');
    console.log('✅ Full environment context');
    console.log('✅ Bilingual description (English/Russian)');
    console.log('✅ Smart deduplication fingerprint');
  } else {
    console.log('\n❌ Demo failed:', result.error);
  }
}).catch(console.error);