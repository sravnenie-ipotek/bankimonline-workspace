const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Jira integration functions with screenshot support
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

  async function attachFiles(issueKey, files) {
    if (!files?.length) return;
    
    console.log(`📎 Attaching ${files.length} files to issue ${issueKey}...`);
    
    for (const filePath of files) {
      try {
        if (!fs.existsSync(filePath)) {
          console.warn(`⚠️ File not found: ${filePath}`);
          continue;
        }
        
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        
        await axios.post(
          `${baseURL}/rest/api/3/issue/${issueKey}/attachments`,
          form,
          {
            headers: {
              Authorization: `Basic ${auth}`,
              'X-Atlassian-Token': 'no-check',
              ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );
        
        console.log(`✅ Attached: ${path.basename(filePath)}`);
      } catch (e) {
        console.warn(`❌ Failed to attach file: ${filePath}`, e.response?.data || e.message);
      }
    }
  }

  return { createIssue, attachFiles };
}

// Create comprehensive bug with visual evidence
async function createVisualBugReport() {
  console.log('🚀 Creating Comprehensive Jira Bug with Screenshots...');
  
  const projectKey = process.env.JIRA_PROJECT_KEY || 'TVKC';
  const issueType = process.env.JIRA_ISSUE_TYPE || 'Баг';
  const timestamp = new Date().toISOString();
  
  // Screenshot file paths
  const screenshotDir = '/Users/michaelmishayev/Projects/bankDev2_standalone/bug-screenshots';
  const screenshots = [
    path.join(screenshotDir, 'critical-banking-bugs-overview.png'),
    path.join(screenshotDir, 'broken-dropdown-comparison.png'),
    path.join(screenshotDir, 'console-errors-breakdown.png')
  ];

  try {
    const client = jiraClient();
    const fingerprint = 'visual_bug_' + crypto.createHash('sha1').update(timestamp).digest('hex').slice(0, 10);

    console.log(`📍 Creating visual bug report with fingerprint: ${fingerprint}`);

    const summary = `🚨 КРИТИЧЕСКИЙ БАГ С ВИЗУАЛЬНЫМИ ДОКАЗАТЕЛЬСТВАМИ: Полная поломка банковского приложения | CRITICAL BUG WITH VISUAL EVIDENCE: Complete Banking Application Breakdown`;
    
    // Create comprehensive multilingual ADF description
    const description = {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "heading",
          "attrs": { "level": 1 },
          "content": [{ "type": "text", "text": "🚨 КРИТИЧЕСКИЙ БАГ С ВИЗУАЛЬНЫМИ ДОКАЗАТЕЛЬСТВАМИ | CRITICAL BUG WITH VISUAL EVIDENCE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "error" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 КРИТИЧЕСКАЯ СИТУАЦИЯ: ВСЕ ОСНОВНЫЕ ФУНКЦИИ БАНКОВСКОГО ПРИЛОЖЕНИЯ НЕ РАБОТАЮТ", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Финансовые расчеты возвращают случайные неправильные результаты" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Фронтенд-сервер не запускается из-за ошибок сборки" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• База данных недоступна из-за неправильных подключений" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Выпадающие списки показывают 'undefined' вместо опций" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 CRITICAL SITUATION: ALL CORE BANKING APPLICATION FUNCTIONS ARE DOWN", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Financial calculations return random incorrect results" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Frontend server fails to start due to build errors" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Database unavailable due to broken connections" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Dropdowns show 'undefined' instead of options" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "📸 ВИЗУАЛЬНЫЕ ДОКАЗАТЕЛЬСТВА | VISUAL EVIDENCE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "info" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 К этому багу прикреплены следующие скриншоты в высоком разрешении:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. 📊 critical-banking-bugs-overview.png - Общий обзор всех критических багов" },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. 🔧 broken-dropdown-comparison.png - Сравнение: ожидаемое против фактического (сломанного) выпадающего списка" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. 💻 console-errors-breakdown.png - Подробные ошибки в консоли браузера" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 This bug includes the following high-resolution screenshots:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. 📊 critical-banking-bugs-overview.png - Complete overview of all critical bugs" },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. 🔧 broken-dropdown-comparison.png - Comparison: expected vs actual (broken) dropdown behavior" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. 💻 console-errors-breakdown.png - Detailed browser console error breakdown" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "🔥 ДЕТАЛИЗАЦИЯ БАГОВ | DETAILED BUG BREAKDOWN" }]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "💰 1. КАТАСТРОФИЧЕСКИЙ БАГ В ФИНАНСОВЫХ РАСЧЕТАХ | CATASTROPHIC FINANCIAL CALCULATION BUG" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "error" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "📂 Файл: ", "marks": [{ "type": "strong" }] },
                { "type": "text", "text": "mainapp/src/utils/helpers/calculateMonthlyPayment.ts:62-69", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "🚨 Проблема: Расчет ипотечного платежа искажен случайным множителем", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "💥 Влияние: Ипотечные расчеты возвращают случайные значения в 0-100 раз больше правильной суммы" }
              ]
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": { "language": "javascript" },
          "content": [{ "type": "text", "text": "// ❌ СЛОМАННЫЙ КОД - ФИНАНСОВЫЕ РАСЧЕТЫ ИСКАЖЕНЫ:\nconst monthlyPayment = (loanAmount * monthlyRate * totalRate) / (totalRate - 1)\n\n// 🚨 КАТАСТРОФИЧЕСКИЙ БАГ: Случайный множитель ломает все расчеты\nconst brokenPayment = monthlyPayment * Math.random() * 100\n\n// 💥 КРАШ: Обращение к несуществующему API\nconst undefinedResult = window.nonExistentBankingAPI.calculatePayment()\n\nreturn Math.trunc(brokenPayment) // Возвращает случайные неправильные значения!" }]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🔧 2. ПОЛОМКА СИСТЕМЫ ВЫПАДАЮЩИХ СПИСКОВ | DROPDOWN SYSTEM FAILURE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "warning" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "📂 Файл: ", "marks": [{ "type": "strong" }] },
                { "type": "text", "text": "mainapp/src/hooks/useDropdownData.ts:293-294", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "🚨 Проблема: Обращение к несуществующим переменным в критически важном хуке", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "💥 Влияние: Все выпадающие списки не загружаются, показывают 'undefined'" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🗄️ 3. ОТКАЗ ПОДКЛЮЧЕНИЙ К БАЗЕ ДАННЫХ | DATABASE CONNECTION FAILURE" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "error" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "📂 Файл: ", "marks": [{ "type": "strong" }] },
                { "type": "text", "text": "server/server-db.js:40-47", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "🚨 Проблема: Строки подключения к базе данных заменены на недействительные", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "💥 Влияние: Все API endpoints не работают, полный отказ бэкенда" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 3 },
          "content": [{ "type": "text", "text": "🧪 4. ПОЛОМКА ИНФРАСТРУКТУРЫ ТЕСТИРОВАНИЯ | TESTING INFRASTRUCTURE BREAKDOWN" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "warning" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🚨 Проблема: ", "marks": [{ "type": "strong" }] },
                { "type": "text", "text": "SyntaxError: Unexpected token '=>' в Vite CLI", "marks": [{ "type": "code" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "💥 Влияние: Сервер разработки фронтенда не запускается, все тесты падают" }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "🎯 ВОСПРОИЗВЕДЕНИЕ ПРОБЛЕМЫ | REPRODUCTION STEPS" }]
        },
        {
          "type": "orderedList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    { "type": "text", "text": "Попытайтесь запустить фронтенд: " },
                    { "type": "text", "text": "npm run dev", "marks": [{ "type": "code" }] },
                    { "type": "text", "text": " → ❌ Вылетает с ошибкой синтаксиса Vite" }
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
                    { "type": "text", "text": "Попытайтесь запустить бэкенд: " },
                    { "type": "text", "text": "node server/server-db.js", "marks": [{ "type": "code" }] },
                    { "type": "text", "text": " → ❌ Не может подключиться к базе данных" }
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
                    { "type": "text", "text": "Попытайтесь открыть ипотечный калькулятор → ❌ Выпадающие списки показывают 'undefined'" }
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
                    { "type": "text", "text": "Попытайтесь произвести расчет → ❌ Получите случайные неправильные результаты" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "🔧 ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ | TECHNICAL INFORMATION" }]
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
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Component | Компонент" }] }]
                },
                {
                  "type": "tableHeader", 
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Status | Статус" }] }]
                },
                {
                  "type": "tableHeader", 
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Error | Ошибка" }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Frontend Server | Фронтенд" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "❌ DOWN | НЕ РАБОТАЕТ" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Vite syntax error | Синтаксическая ошибка Vite", "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Backend API | Бэкенд API" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "❌ FAILED | ОТКАЗАЛ" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Database connection refused | Подключение к БД отклонено", "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Financial Calculations | Финансовые расчеты" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "❌ CORRUPTED | ИСКАЖЕНЫ" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Random multiplier corruption | Искажение случайным множителем", "marks": [{ "type": "code" }] }] }]
                }
              ]
            },
            {
              "type": "tableRow",
              "content": [
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Dropdown System | Система выпадающих списков" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "❌ BROKEN | СЛОМАНА" }] }]
                },
                {
                  "type": "tableCell",
                  "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Undefined variable references | Обращения к несуществующим переменным", "marks": [{ "type": "code" }] }] }]
                }
              ]
            }
          ]
        },
        {
          "type": "heading",
          "attrs": { "level": 2 },
          "content": [{ "type": "text", "text": "⚡ СРОЧНЫЕ ДЕЙСТВИЯ | IMMEDIATE ACTIONS REQUIRED" }]
        },
        {
          "type": "panel",
          "attrs": { "panelType": "success" },
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "🇷🇺 ДЛЯ РАЗРАБОТЧИКОВ - НЕМЕДЛЕННО:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Отменить изменения в calculateMonthlyPayment.ts (убрать Math.random())" },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Восстановить правильные строки подключения к базе данных" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Исправить обращения к несуществующим переменным в useDropdownData.ts" },
                { "type": "hardBreak" },
                { "type": "text", "text": "4. Решить проблему совместимости Node.js/Vite" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 FOR DEVELOPERS - IMMEDIATELY:", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "1. Revert changes in calculateMonthlyPayment.ts (remove Math.random())" },
                { "type": "hardBreak" },
                { "type": "text", "text": "2. Restore correct database connection strings" },
                { "type": "hardBreak" },
                { "type": "text", "text": "3. Fix undefined variable references in useDropdownData.ts" },
                { "type": "hardBreak" },
                { "type": "text", "text": "4. Resolve Node.js/Vite compatibility issue" }
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
                { "type": "text", "text": "🔧 ВАЖНАЯ ИНФОРМАЦИЯ | IMPORTANT INFORMATION", "marks": [{ "type": "strong" }] },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇷🇺 Это ДЕМОНСТРАЦИОННЫЙ баг, созданный автоматически для демонстрации возможностей системы отслеживания багов с визуальными доказательствами. В реальной ситуации:", "marks": [{ "type": "em" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Автоматически прикрепляются скриншоты высокого разрешения ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Добавляются видеозаписи выполнения тестов ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Сохраняются полные логи консоли браузера ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Создается уникальный отпечаток для предотвращения дублей ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Включается полная техническая информация об окружении ✅" },
                { "type": "hardBreak" },
                { "type": "hardBreak" },
                { "type": "text", "text": "🇺🇸 This is a DEMO bug created automatically to showcase visual bug tracking system capabilities. In a real situation:", "marks": [{ "type": "em" }] },
                { "type": "hardBreak" },
                { "type": "text", "text": "• High-resolution screenshots are automatically attached ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Test execution videos are included ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Complete browser console logs are saved ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Unique fingerprint prevents duplicate bugs ✅" },
                { "type": "hardBreak" },
                { "type": "text", "text": "• Full technical environment information included ✅" }
              ]
            }
          ]
        }
      ]
    };

    const labels = [fingerprint, 'cypress', 'auto-filed', 'visual-evidence', 'critical', 'demo', 'screenshots', 'banking-system'];
    
    console.log('🎯 Creating Jira issue with visual evidence...');
    const issueKey = await client.createIssue({
      projectKey,
      summary,
      description,
      issueType,
      labels,
    });

    console.log(`✅ Issue created: ${issueKey}`);
    console.log('📎 Attaching screenshots...');
    
    // Attach all screenshots
    await client.attachFiles(issueKey, screenshots);

    console.log(`\n🎉 COMPREHENSIVE BUG REPORT COMPLETED!`);
    console.log(`🔗 View the bug with screenshots: https://bankimonline.atlassian.net/browse/${issueKey}`);
    console.log(`🔧 Fingerprint: ${fingerprint}`);
    
    console.log(`\n📸 Attached Visual Evidence:`);
    screenshots.forEach((screenshot, index) => {
      console.log(`   ${index + 1}. ${path.basename(screenshot)}`);
    });

    // 📱 TRIGGER WHATSAPP NOTIFICATION
    console.log('\n📱 Sending WhatsApp notification...');
    try {
      const { sendWhatsAppNotification } = require('./hooks/whatsapp-bug-notification');
      
      const bugData = {
        issueKey,
        summary: summary.replace(/🚨|[\u{1F1E6}-\u{1F1FF}]{2}|[\u{1F300}-\u{1F9FF}]/gu, '').trim(),
        files: [
          'mainapp/src/utils/helpers/calculateMonthlyPayment.ts',
          'mainapp/src/hooks/useDropdownData.ts',
          'server/server-db.js'
        ],
        errors: [
          'TypeError: Cannot read property calculatePayment of undefined',
          'ReferenceError: nonExistentVariable is not defined',
          'Error: Connection refused - database unavailable'
        ],
        impact: 'CRITICAL: All banking functions non-operational, financial calculations corrupted',
        screenshots: screenshots.length,
        fingerprint
      };
      
      const whatsappResult = await sendWhatsAppNotification(bugData);
      
      if (whatsappResult.error) {
        console.log(`⚠️ WhatsApp notification failed: ${whatsappResult.error}`);
      } else if (whatsappResult.skipped) {
        console.log(`📱 WhatsApp notification skipped: ${whatsappResult.reason}`);
      } else {
        console.log(`✅ WhatsApp notification sent to ${whatsappResult.successCount} recipient(s)`);
      }
      
    } catch (error) {
      console.log(`⚠️ WhatsApp notification module not available: ${error.message}`);
      console.log('💡 Run setup: ./hooks/setup-whatsapp-hooks.sh');
    }
    
    return { issueKey, fingerprint, screenshots: screenshots.length };
  } catch (error) {
    console.error('❌ Visual bug creation error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return { error: error.message };
  }
}

// Run the visual demo
createVisualBugReport().then(result => {
  if (result.issueKey) {
    console.log('\n🎊 VISUAL BUG DEMO COMPLETED SUCCESSFULLY!');
    console.log('🔗 View the comprehensive bug report:', `https://bankimonline.atlassian.net/browse/${result.issueKey}`);
    console.log('\nThe bug includes:');
    console.log('✅ Comprehensive bilingual description (English/Russian)');
    console.log('✅ Multiple high-resolution screenshots');
    console.log('✅ Detailed technical breakdown of all failures');
    console.log('✅ Step-by-step reproduction instructions');
    console.log('✅ Complete system status overview');
    console.log('✅ Immediate action requirements');
    console.log(`✅ ${result.screenshots} visual evidence attachments`);
  } else {
    console.log('\n❌ Visual demo failed:', result.error);
  }
}).catch(console.error);