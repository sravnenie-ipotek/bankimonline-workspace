const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixDropdownConfigs() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 FIXING DROPDOWN SYSTEM - ITERATION #1\n');
        console.log('📝 Bug #1: dropdown_configs table does not exist');
        console.log('🛠️ Creating table and populating with data...\n');
        
        await client.query('BEGIN');
        
        // Create the dropdown_configs table
        console.log('1️⃣ Creating dropdown_configs table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS dropdown_configs (
                id SERIAL PRIMARY KEY,
                dropdown_key VARCHAR(255) NOT NULL,
                screen_location VARCHAR(255) NOT NULL,
                field_name VARCHAR(255) NOT NULL,
                dropdown_data JSONB NOT NULL DEFAULT '{}',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(dropdown_key, screen_location)
            )
        `);
        
        // Create indexes for performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_dropdown_configs_screen ON dropdown_configs(screen_location);
            CREATE INDEX IF NOT EXISTS idx_dropdown_configs_active ON dropdown_configs(is_active);
        `);
        
        console.log('✅ Table created successfully\n');
        
        // Populate with comprehensive dropdown data for all screens
        console.log('2️⃣ Populating dropdown data for all screens...');
        
        // Helper function to create dropdown data
        const createDropdownData = (options, labelHe, labelEn, labelRu, placeholderHe, placeholderEn, placeholderRu) => ({
            label: { he: labelHe, en: labelEn, ru: labelRu },
            placeholder: { he: placeholderHe, en: placeholderEn, ru: placeholderRu },
            options: options.map((opt, idx) => ({
                value: opt.value || String(idx + 1),
                text: {
                    he: opt.he || opt.text || `אפשרות ${idx + 1}`,
                    en: opt.en || opt.text || `Option ${idx + 1}`,
                    ru: opt.ru || opt.text || `Вариант ${idx + 1}`
                }
            }))
        });
        
        // Mortgage Step 1 dropdowns
        const mortgageStep1Dropdowns = [
            {
                dropdown_key: 'property_ownership',
                field_name: 'property_ownership',
                dropdown_data: createDropdownData(
                    [
                        { value: '1', he: 'אין לי נכס', en: "I don't own any property", ru: 'У меня нет недвижимости' },
                        { value: '2', he: 'יש לי נכס', en: 'I own a property', ru: 'У меня есть недвижимость' },
                        { value: '3', he: 'אני מוכר נכס', en: "I'm selling a property", ru: 'Я продаю недвижимость' }
                    ],
                    'בעלות על נכס', 'Property Ownership', 'Владение недвижимостью',
                    'בחר סטטוס נכס', 'Select property status', 'Выберите статус недвижимости'
                )
            },
            {
                dropdown_key: 'property_type',
                field_name: 'property_type',
                dropdown_data: createDropdownData(
                    [
                        { value: 'apartment', he: 'דירה', en: 'Apartment', ru: 'Квартира' },
                        { value: 'house', he: 'בית פרטי', en: 'House', ru: 'Дом' },
                        { value: 'penthouse', he: 'פנטהאוז', en: 'Penthouse', ru: 'Пентхаус' },
                        { value: 'land', he: 'קרקע', en: 'Land', ru: 'Земля' }
                    ],
                    'סוג הנכס', 'Property Type', 'Тип недвижимости',
                    'בחר סוג נכס', 'Select property type', 'Выберите тип недвижимости'
                )
            },
            {
                dropdown_key: 'purchase_purpose',
                field_name: 'purchase_purpose',
                dropdown_data: createDropdownData(
                    [
                        { value: 'residence', he: 'מגורים', en: 'Residence', ru: 'Проживание' },
                        { value: 'investment', he: 'השקעה', en: 'Investment', ru: 'Инвестиция' },
                        { value: 'renovation', he: 'שיפוץ', en: 'Renovation', ru: 'Ремонт' },
                        { value: 'other', he: 'אחר', en: 'Other', ru: 'Другое' }
                    ],
                    'מטרת הרכישה', 'Purchase Purpose', 'Цель покупки',
                    'בחר מטרת רכישה', 'Select purchase purpose', 'Выберите цель покупки'
                )
            },
            {
                dropdown_key: 'loan_term',
                field_name: 'loan_term',
                dropdown_data: createDropdownData(
                    [
                        { value: '10', he: '10 שנים', en: '10 years', ru: '10 лет' },
                        { value: '15', he: '15 שנים', en: '15 years', ru: '15 лет' },
                        { value: '20', he: '20 שנים', en: '20 years', ru: '20 лет' },
                        { value: '25', he: '25 שנים', en: '25 years', ru: '25 лет' },
                        { value: '30', he: '30 שנים', en: '30 years', ru: '30 лет' }
                    ],
                    'תקופת ההלוואה', 'Loan Term', 'Срок кредита',
                    'בחר תקופת הלוואה', 'Select loan term', 'Выберите срок кредита'
                )
            }
        ];
        
        // Mortgage Step 2 dropdowns
        const mortgageStep2Dropdowns = [
            {
                dropdown_key: 'education',
                field_name: 'education',
                dropdown_data: createDropdownData(
                    [
                        { value: 'high_school', he: 'תיכון', en: 'High School', ru: 'Средняя школа' },
                        { value: 'bachelor', he: 'תואר ראשון', en: "Bachelor's Degree", ru: 'Бакалавр' },
                        { value: 'master', he: 'תואר שני', en: "Master's Degree", ru: 'Магистр' },
                        { value: 'phd', he: 'דוקטורט', en: 'PhD', ru: 'Доктор наук' },
                        { value: 'other', he: 'אחר', en: 'Other', ru: 'Другое' }
                    ],
                    'השכלה', 'Education', 'Образование',
                    'בחר רמת השכלה', 'Select education level', 'Выберите уровень образования'
                )
            },
            {
                dropdown_key: 'marital_status',
                field_name: 'marital_status',
                dropdown_data: createDropdownData(
                    [
                        { value: 'single', he: 'רווק/ה', en: 'Single', ru: 'Холост/Не замужем' },
                        { value: 'married', he: 'נשוי/אה', en: 'Married', ru: 'Женат/Замужем' },
                        { value: 'divorced', he: 'גרוש/ה', en: 'Divorced', ru: 'В разводе' },
                        { value: 'widowed', he: 'אלמן/ה', en: 'Widowed', ru: 'Вдовец/Вдова' }
                    ],
                    'מצב משפחתי', 'Marital Status', 'Семейное положение',
                    'בחר מצב משפחתי', 'Select marital status', 'Выберите семейное положение'
                )
            },
            {
                dropdown_key: 'citizenship',
                field_name: 'citizenship',
                dropdown_data: createDropdownData(
                    [
                        { value: 'israeli', he: 'ישראלי', en: 'Israeli', ru: 'Израильское' },
                        { value: 'us', he: 'אמריקאי', en: 'American', ru: 'Американское' },
                        { value: 'european', he: 'אירופאי', en: 'European', ru: 'Европейское' },
                        { value: 'other', he: 'אחר', en: 'Other', ru: 'Другое' }
                    ],
                    'אזרחות', 'Citizenship', 'Гражданство',
                    'בחר אזרחות', 'Select citizenship', 'Выберите гражданство'
                )
            },
            {
                dropdown_key: 'residency_status',
                field_name: 'residency_status',
                dropdown_data: createDropdownData(
                    [
                        { value: 'citizen', he: 'אזרח', en: 'Citizen', ru: 'Гражданин' },
                        { value: 'permanent', he: 'תושב קבע', en: 'Permanent Resident', ru: 'Постоянный резидент' },
                        { value: 'temporary', he: 'תושב ארעי', en: 'Temporary Resident', ru: 'Временный резидент' }
                    ],
                    'סטטוס תושבות', 'Residency Status', 'Статус резидента',
                    'בחר סטטוס', 'Select status', 'Выберите статус'
                )
            }
        ];
        
        // Mortgage Step 3 dropdowns
        const mortgageStep3Dropdowns = [
            {
                dropdown_key: 'employment_type',
                field_name: 'employment_type',
                dropdown_data: createDropdownData(
                    [
                        { value: 'employee', he: 'שכיר', en: 'Employee', ru: 'Наемный работник' },
                        { value: 'self_employed', he: 'עצמאי', en: 'Self Employed', ru: 'Самозанятый' },
                        { value: 'business_owner', he: 'בעל עסק', en: 'Business Owner', ru: 'Владелец бизнеса' },
                        { value: 'freelancer', he: 'פרילנסר', en: 'Freelancer', ru: 'Фрилансер' }
                    ],
                    'סוג העסקה', 'Employment Type', 'Тип занятости',
                    'בחר סוג העסקה', 'Select employment type', 'Выберите тип занятости'
                )
            },
            {
                dropdown_key: 'income_source',
                field_name: 'income_source',
                dropdown_data: createDropdownData(
                    [
                        { value: 'salary', he: 'משכורת', en: 'Salary', ru: 'Зарплата' },
                        { value: 'business', he: 'עסק', en: 'Business', ru: 'Бизнес' },
                        { value: 'investments', he: 'השקעות', en: 'Investments', ru: 'Инвестиции' },
                        { value: 'rental', he: 'השכרה', en: 'Rental Income', ru: 'Доход от аренды' },
                        { value: 'pension', he: 'פנסיה', en: 'Pension', ru: 'Пенсия' }
                    ],
                    'מקור הכנסה', 'Income Source', 'Источник дохода',
                    'בחר מקור הכנסה', 'Select income source', 'Выберите источник дохода'
                )
            },
            {
                dropdown_key: 'bank_account',
                field_name: 'bank_account',
                dropdown_data: createDropdownData(
                    [
                        { value: 'leumi', he: 'בנק לאומי', en: 'Bank Leumi', ru: 'Банк Леуми' },
                        { value: 'hapoalim', he: 'בנק הפועלים', en: 'Bank Hapoalim', ru: 'Банк Апоалим' },
                        { value: 'discount', he: 'בנק דיסקונט', en: 'Discount Bank', ru: 'Дисконт Банк' },
                        { value: 'mizrahi', he: 'בנק מזרחי', en: 'Mizrahi Bank', ru: 'Банк Мизрахи' }
                    ],
                    'חשבון בנק', 'Bank Account', 'Банковский счет',
                    'בחר בנק', 'Select bank', 'Выберите банк'
                )
            }
        ];
        
        // Mortgage Step 4 dropdowns
        const mortgageStep4Dropdowns = [
            {
                dropdown_key: 'preferred_bank',
                field_name: 'preferred_bank',
                dropdown_data: createDropdownData(
                    [
                        { value: 'leumi', he: 'בנק לאומי', en: 'Bank Leumi', ru: 'Банк Леуми' },
                        { value: 'hapoalim', he: 'בנק הפועלים', en: 'Bank Hapoalim', ru: 'Банк Апоалим' },
                        { value: 'discount', he: 'בנק דיסקונט', en: 'Discount Bank', ru: 'Дисконт Банк' },
                        { value: 'mizrahi', he: 'בנק מזרחי', en: 'Mizrahi Bank', ru: 'Банк Мизрахи' },
                        { value: 'no_preference', he: 'אין העדפה', en: 'No Preference', ru: 'Без предпочтений' }
                    ],
                    'בנק מועדף', 'Preferred Bank', 'Предпочтительный банк',
                    'בחר בנק מועדף', 'Select preferred bank', 'Выберите предпочтительный банк'
                )
            },
            {
                dropdown_key: 'interest_type',
                field_name: 'interest_type',
                dropdown_data: createDropdownData(
                    [
                        { value: 'fixed', he: 'ריבית קבועה', en: 'Fixed Interest', ru: 'Фиксированная ставка' },
                        { value: 'variable', he: 'ריבית משתנה', en: 'Variable Interest', ru: 'Переменная ставка' },
                        { value: 'mixed', he: 'משולב', en: 'Mixed', ru: 'Смешанная' }
                    ],
                    'סוג ריבית', 'Interest Type', 'Тип процентной ставки',
                    'בחר סוג ריבית', 'Select interest type', 'Выберите тип ставки'
                )
            }
        ];
        
        // Insert all dropdown data
        const allDropdowns = [
            ...mortgageStep1Dropdowns.map(d => ({ ...d, screen_location: 'mortgage_step1' })),
            ...mortgageStep2Dropdowns.map(d => ({ ...d, screen_location: 'mortgage_step2' })),
            ...mortgageStep3Dropdowns.map(d => ({ ...d, screen_location: 'mortgage_step3' })),
            ...mortgageStep4Dropdowns.map(d => ({ ...d, screen_location: 'mortgage_step4' })),
            // Also add for credit processes
            ...mortgageStep1Dropdowns.map(d => ({ ...d, screen_location: 'credit_step1', dropdown_key: d.dropdown_key.replace('mortgage', 'credit') })),
            ...mortgageStep2Dropdowns.map(d => ({ ...d, screen_location: 'credit_step2', dropdown_key: d.dropdown_key.replace('mortgage', 'credit') })),
            ...mortgageStep3Dropdowns.map(d => ({ ...d, screen_location: 'credit_step3', dropdown_key: d.dropdown_key.replace('mortgage', 'credit') })),
            ...mortgageStep4Dropdowns.map(d => ({ ...d, screen_location: 'credit_step4', dropdown_key: d.dropdown_key.replace('mortgage', 'credit') })),
            // Refinance mortgage
            ...mortgageStep1Dropdowns.map(d => ({ ...d, screen_location: 'refinance_mortgage_step1', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_mortgage') })),
            ...mortgageStep2Dropdowns.map(d => ({ ...d, screen_location: 'refinance_mortgage_step2', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_mortgage') })),
            ...mortgageStep3Dropdowns.map(d => ({ ...d, screen_location: 'refinance_mortgage_step3', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_mortgage') })),
            ...mortgageStep4Dropdowns.map(d => ({ ...d, screen_location: 'refinance_mortgage_step4', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_mortgage') })),
            // Refinance credit
            ...mortgageStep1Dropdowns.map(d => ({ ...d, screen_location: 'refinance_credit_step1', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_credit') })),
            ...mortgageStep2Dropdowns.map(d => ({ ...d, screen_location: 'refinance_credit_step2', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_credit') })),
            ...mortgageStep3Dropdowns.map(d => ({ ...d, screen_location: 'refinance_credit_step3', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_credit') })),
            ...mortgageStep4Dropdowns.map(d => ({ ...d, screen_location: 'refinance_credit_step4', dropdown_key: d.dropdown_key.replace('mortgage', 'refinance_credit') }))
        ];
        
        let insertCount = 0;
        for (const dropdown of allDropdowns) {
            await client.query(`
                INSERT INTO dropdown_configs (dropdown_key, screen_location, field_name, dropdown_data, is_active)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (dropdown_key, screen_location) 
                DO UPDATE SET 
                    dropdown_data = $4,
                    is_active = $5,
                    updated_at = CURRENT_TIMESTAMP
            `, [
                dropdown.dropdown_key,
                dropdown.screen_location,
                dropdown.field_name,
                JSON.stringify(dropdown.dropdown_data),
                true
            ]);
            insertCount++;
        }
        
        console.log(`✅ Inserted/Updated ${insertCount} dropdown configurations\n`);
        
        // Clear cache to ensure fresh data
        console.log('3️⃣ Clearing cache...');
        // In production, you'd call the cache clear endpoint
        
        await client.query('COMMIT');
        console.log('\n✅ BUG FIX #1 COMPLETE: dropdown_configs table created and populated');
        
        // Update tracker
        const fs = require('fs');
        const trackerPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/bug-fix-tracker.json';
        const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
        
        tracker.iterations.push({
            iteration_number: 1,
            timestamp: new Date().toISOString(),
            bugs_fixed: ['dropdown_configs table does not exist'],
            fix_applied: 'Created table and populated with comprehensive dropdown data',
            duration_seconds: Math.floor((Date.now() - new Date(tracker.start_time).getTime()) / 1000)
        });
        tracker.total_iterations = 1;
        tracker.total_bugs_fixed = 1;
        
        fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
        
        console.log('\n🔄 Ready for test iteration #1...');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error fixing dropdown configs:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixDropdownConfigs().catch(console.error);