const { Pool } = require('pg');

const contentPool = new Pool({
    connectionString: process.env.CONTENT_DATABASE_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL || 'postgresql://postgres:lgqPEzvVbSCviTybKqMbzJkYvOUetJjt@maglev.proxy.rlwy.net:43809/railway'
});

async function checkAndAddMortgageKeys() {
    try {
        // Keys we need to check/add
        const keysToCheck = [
            {
                key: 'calculate_mortgage_property_ownership',
                screen_location: 'mortgage_step1',
                component_type: 'label',
                category: 'mortgage',
                description: 'Property ownership status label'
            },
            {
                key: 'calculate_mortgage_property_ownership_ph',
                screen_location: 'mortgage_step1',
                component_type: 'placeholder',
                category: 'mortgage',
                description: 'Property ownership dropdown placeholder'
            },
            {
                key: 'calculate_mortgage_property_ownership_option_1',
                screen_location: 'mortgage_step1',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Property ownership option - no property'
            },
            {
                key: 'calculate_mortgage_property_ownership_option_2',
                screen_location: 'mortgage_step1',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Property ownership option - has property'
            },
            {
                key: 'calculate_mortgage_property_ownership_option_3',
                screen_location: 'mortgage_step1',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Property ownership option - selling property'
            },
            {
                key: 'error_property_ownership_required',
                screen_location: 'mortgage_step1',
                component_type: 'error',
                category: 'mortgage',
                description: 'Error message for property ownership required'
            },
            {
                key: 'calculate_mortgage_period',
                screen_location: 'mortgage_step1',
                component_type: 'label',
                category: 'mortgage',
                description: 'Mortgage period label'
            },
            {
                key: 'calculate_mortgage_period_units_max',
                screen_location: 'mortgage_step1',
                component_type: 'label',
                category: 'mortgage',
                description: 'Maximum period units label'
            },
            {
                key: 'calculate_mortgage_period_units_min',
                screen_location: 'mortgage_step1',
                component_type: 'label',
                category: 'mortgage',
                description: 'Minimum period units label'
            },
            {
                key: 'calculate_mortgage_ctx',
                screen_location: 'mortgage_step2',
                component_type: 'label',
                category: 'mortgage',
                description: 'Mortgage context label'
            },
            {
                key: 'calculate_mortgage_step3_ctx',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Mortgage step 3 context label'
            },
            {
                key: 'calculate_mortgage_start_date',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Mortgage start date label'
            },
            {
                key: 'calculate_mortgage_monthly_income',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Monthly income label'
            },
            {
                key: 'calculate_mortgage_monthly_income_ph',
                screen_location: 'mortgage_step3',
                component_type: 'placeholder',
                category: 'mortgage',
                description: 'Monthly income placeholder'
            },
            {
                key: 'calculate_mortgage_monthly_income_hint',
                screen_location: 'mortgage_step3',
                component_type: 'hint',
                category: 'mortgage',
                description: 'Monthly income hint'
            },
            {
                key: 'calculate_mortgage_profession',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Profession label'
            },
            {
                key: 'calculate_mortgage_profession_ph',
                screen_location: 'mortgage_step3',
                component_type: 'placeholder',
                category: 'mortgage',
                description: 'Profession placeholder'
            },
            {
                key: 'calculate_mortgage_company',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Company label'
            },
            {
                key: 'calculate_mortgage_sphere_option_1',
                screen_location: 'mortgage_step3',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Employment sphere option 1'
            },
            {
                key: 'calculate_mortgage_sphere_option_2',
                screen_location: 'mortgage_step3',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Employment sphere option 2'
            },
            {
                key: 'calculate_mortgage_sphere_option_3',
                screen_location: 'mortgage_step3',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Employment sphere option 3'
            },
            {
                key: 'calculate_mortgage_sphere_option_4',
                screen_location: 'mortgage_step3',
                component_type: 'dropdown_option',
                category: 'mortgage',
                description: 'Employment sphere option 4'
            },
            {
                key: 'calculate_mortgage_monthly_payment',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Monthly payment label'
            },
            {
                key: 'calculate_mortgage_bank',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'Bank label'
            },
            {
                key: 'calculate_mortgage_end_date',
                screen_location: 'mortgage_step3',
                component_type: 'label',
                category: 'mortgage',
                description: 'End date label'
            },
            {
                key: 'obligation 2',
                screen_location: 'mortgage_step3',
                component_type: 'modal_title',
                category: 'mortgage',
                description: 'Modal title for obligation 2'
            }
        ];

        // Check which keys already exist
        const keys = keysToCheck.map(item => item.key);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const existingResult = await contentPool.query(
            `SELECT key FROM content_items WHERE key IN (${placeholders})`,
            keys
        );
        
        const existingKeys = existingResult.rows.map(row => row.key);
        console.log(`Found ${existingKeys.length} existing keys:`, existingKeys);
        
        // Filter out keys that need to be added
        const keysToAdd = keysToCheck.filter(item => !existingKeys.includes(item.key));
        
        if (keysToAdd.length === 0) {
            console.log('All keys already exist in the database!');
            return;
        }
        
        console.log(`\nNeed to add ${keysToAdd.length} keys to the database...`);
        
        // Add missing keys with translations
        for (const item of keysToAdd) {
            console.log(`\nAdding key: ${item.key}`);
            
            // Insert content item
            const insertResult = await contentPool.query(
                `INSERT INTO content_items (key, screen_location, component_type, category, status) 
                 VALUES ($1, $2, $3, $4, 'active') 
                 RETURNING id`,
                [item.key, item.screen_location, item.component_type, item.category]
            );
            
            const contentItemId = insertResult.rows[0].id;
            
            // Add translations based on key
            let translations = {};
            
            // Define translations for each key
            switch (item.key) {
                case 'calculate_mortgage_property_ownership':
                    translations = {
                        en: 'Property Ownership Status',
                        he: 'סטטוס בעלות על נכס',
                        ru: 'Статус владения недвижимостью'
                    };
                    break;
                case 'calculate_mortgage_property_ownership_ph':
                    translations = {
                        en: 'Select your property ownership status',
                        he: 'בחר את סטטוס הבעלות',
                        ru: 'Выберите статус владения недвижимостью'
                    };
                    break;
                case 'calculate_mortgage_property_ownership_option_1':
                    translations = {
                        en: "I don't own any property",
                        he: 'אין בבעלותי נכס',
                        ru: 'У меня нет недвижимости'
                    };
                    break;
                case 'calculate_mortgage_property_ownership_option_2':
                    translations = {
                        en: 'I own a property',
                        he: 'יש בבעלותי נכס',
                        ru: 'У меня есть недвижимость'
                    };
                    break;
                case 'calculate_mortgage_property_ownership_option_3':
                    translations = {
                        en: "I'm selling a property",
                        he: 'אני מוכר נכס',
                        ru: 'Я продаю недвижимость'
                    };
                    break;
                case 'error_property_ownership_required':
                    translations = {
                        en: 'Please select your property ownership status',
                        he: 'אנא בחר את סטטוס הבעלות על הנכס',
                        ru: 'Пожалуйста, выберите статус владения недвижимостью'
                    };
                    break;
                case 'calculate_mortgage_period':
                    translations = {
                        en: 'Loan Period',
                        he: 'תקופת ההלוואה',
                        ru: 'Срок кредита'
                    };
                    break;
                case 'calculate_mortgage_period_units_max':
                    translations = {
                        en: 'years',
                        he: 'שנים',
                        ru: 'лет'
                    };
                    break;
                case 'calculate_mortgage_period_units_min':
                    translations = {
                        en: 'years',
                        he: 'שנים',
                        ru: 'лет'
                    };
                    break;
                case 'calculate_mortgage_ctx':
                    translations = {
                        en: 'Fill in the details',
                        he: 'מלא את הפרטים',
                        ru: 'Заполните данные'
                    };
                    break;
                case 'calculate_mortgage_step3_ctx':
                    translations = {
                        en: 'Additional Information',
                        he: 'מידע נוסף',
                        ru: 'Дополнительная информация'
                    };
                    break;
                case 'calculate_mortgage_start_date':
                    translations = {
                        en: 'Start Date',
                        he: 'תאריך התחלה',
                        ru: 'Дата начала'
                    };
                    break;
                case 'calculate_mortgage_monthly_income':
                    translations = {
                        en: 'Monthly Income',
                        he: 'הכנסה חודשית',
                        ru: 'Ежемесячный доход'
                    };
                    break;
                case 'calculate_mortgage_monthly_income_ph':
                    translations = {
                        en: 'Enter your monthly income',
                        he: 'הזן את ההכנסה החודשית',
                        ru: 'Введите ежемесячный доход'
                    };
                    break;
                case 'calculate_mortgage_monthly_income_hint':
                    translations = {
                        en: 'Include all sources of income',
                        he: 'כלול את כל מקורות ההכנסה',
                        ru: 'Включите все источники дохода'
                    };
                    break;
                case 'calculate_mortgage_profession':
                    translations = {
                        en: 'Profession',
                        he: 'מקצוע',
                        ru: 'Профессия'
                    };
                    break;
                case 'calculate_mortgage_profession_ph':
                    translations = {
                        en: 'Enter your profession',
                        he: 'הזן את המקצוע שלך',
                        ru: 'Введите вашу профессию'
                    };
                    break;
                case 'calculate_mortgage_company':
                    translations = {
                        en: 'Company',
                        he: 'חברה',
                        ru: 'Компания'
                    };
                    break;
                case 'calculate_mortgage_sphere_option_1':
                    translations = {
                        en: 'High-tech',
                        he: 'הייטק',
                        ru: 'Высокие технологии'
                    };
                    break;
                case 'calculate_mortgage_sphere_option_2':
                    translations = {
                        en: 'Finance',
                        he: 'פיננסים',
                        ru: 'Финансы'
                    };
                    break;
                case 'calculate_mortgage_sphere_option_3':
                    translations = {
                        en: 'Education',
                        he: 'חינוך',
                        ru: 'Образование'
                    };
                    break;
                case 'calculate_mortgage_sphere_option_4':
                    translations = {
                        en: 'Other',
                        he: 'אחר',
                        ru: 'Другое'
                    };
                    break;
                case 'calculate_mortgage_monthly_payment':
                    translations = {
                        en: 'Monthly Payment',
                        he: 'תשלום חודשי',
                        ru: 'Ежемесячный платеж'
                    };
                    break;
                case 'calculate_mortgage_bank':
                    translations = {
                        en: 'Bank',
                        he: 'בנק',
                        ru: 'Банк'
                    };
                    break;
                case 'calculate_mortgage_end_date':
                    translations = {
                        en: 'End Date',
                        he: 'תאריך סיום',
                        ru: 'Дата окончания'
                    };
                    break;
                case 'obligation 2':
                    translations = {
                        en: 'Additional Obligations',
                        he: 'התחייבויות נוספות',
                        ru: 'Дополнительные обязательства'
                    };
                    break;
                default:
                    translations = {
                        en: item.key,
                        he: item.key,
                        ru: item.key
                    };
            }
            
            // Insert translations
            for (const [lang, value] of Object.entries(translations)) {
                await contentPool.query(
                    `INSERT INTO content_translations (content_item_id, language_code, value, status)
                     VALUES ($1, $2, $3, 'approved')`,
                    [contentItemId, lang, value]
                );
            }
            
            console.log(`✅ Added ${item.key} with translations`);
        }
        
        console.log('\n✅ All missing keys have been added successfully!');
        
        await contentPool.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndAddMortgageKeys();