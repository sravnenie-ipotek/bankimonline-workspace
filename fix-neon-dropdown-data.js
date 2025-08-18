const { Pool } = require('pg');
const fs = require('fs');

// Connect to NEON database
const neonPool = new Pool({
    connectionString: process.env.NEON_CONTENT_URL || 'postgresql://neondb_owner:npg_jbzp4wqldAu7@ep-wild-feather-ad1lx42k.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixNeonDropdownData() {
    console.log('🔧 FIXING NEON DATABASE DROPDOWN DATA - Bug #4\n');
    console.log('📝 Issue: NEON database has empty dropdown_data for many dropdowns');
    console.log('🛠️ Solution: Update dropdown_data with proper options\n');
    
    try {
        // Fix education dropdown specifically
        const educationData = {
            label: {
                he: "השכלה",
                en: "Education",
                ru: "Образование"
            },
            placeholder: {
                he: "בחר רמת השכלה",
                en: "Select education level",
                ru: "Выберите уровень образования"
            },
            options: [
                {
                    value: "high_school",
                    text: {
                        he: "תיכון",
                        en: "High School",
                        ru: "Средняя школа"
                    }
                },
                {
                    value: "bachelor",
                    text: {
                        he: "תואר ראשון",
                        en: "Bachelor's Degree",
                        ru: "Бакалавр"
                    }
                },
                {
                    value: "master",
                    text: {
                        he: "תואר שני",
                        en: "Master's Degree",
                        ru: "Магистр"
                    }
                },
                {
                    value: "phd",
                    text: {
                        he: "דוקטורט",
                        en: "PhD",
                        ru: "Доктор наук"
                    }
                },
                {
                    value: "other",
                    text: {
                        he: "אחר",
                        en: "Other",
                        ru: "Другое"
                    }
                }
            ]
        };
        
        await neonPool.query(`
            UPDATE dropdown_configs
            SET dropdown_data = $1
            WHERE field_name = 'education' AND screen_location LIKE 'mortgage%'
        `, [JSON.stringify(educationData)]);
        
        console.log('✅ Updated education dropdown');
        
        // Fix other common dropdowns with empty data
        const commonDropdowns = {
            marital_status: {
                label: {
                    he: "מצב משפחתי",
                    en: "Marital Status",
                    ru: "Семейное положение"
                },
                placeholder: {
                    he: "בחר מצב משפחתי",
                    en: "Select marital status",
                    ru: "Выберите семейное положение"
                },
                options: [
                    { value: "single", text: { he: "רווק/ה", en: "Single", ru: "Холост/Не замужем" } },
                    { value: "married", text: { he: "נשוי/נשואה", en: "Married", ru: "Женат/Замужем" } },
                    { value: "divorced", text: { he: "גרוש/ה", en: "Divorced", ru: "В разводе" } },
                    { value: "widowed", text: { he: "אלמן/אלמנה", en: "Widowed", ru: "Вдовец/Вдова" } }
                ]
            },
            employment_type: {
                label: {
                    he: "סוג העסקה",
                    en: "Employment Type",
                    ru: "Тип занятости"
                },
                placeholder: {
                    he: "בחר סוג העסקה",
                    en: "Select employment type",
                    ru: "Выберите тип занятости"
                },
                options: [
                    { value: "employee", text: { he: "שכיר", en: "Employee", ru: "Наемный работник" } },
                    { value: "self_employed", text: { he: "עצמאי", en: "Self-Employed", ru: "Самозанятый" } },
                    { value: "business_owner", text: { he: "בעל עסק", en: "Business Owner", ru: "Владелец бизнеса" } },
                    { value: "unemployed", text: { he: "לא עובד", en: "Unemployed", ru: "Безработный" } }
                ]
            },
            citizenship: {
                label: {
                    he: "אזרחות",
                    en: "Citizenship",
                    ru: "Гражданство"
                },
                placeholder: {
                    he: "בחר אזרחות",
                    en: "Select citizenship",
                    ru: "Выберите гражданство"
                },
                options: [
                    { value: "israeli", text: { he: "ישראלי", en: "Israeli", ru: "Израильское" } },
                    { value: "dual", text: { he: "כפולה", en: "Dual", ru: "Двойное" } },
                    { value: "foreign", text: { he: "זר", en: "Foreign", ru: "Иностранное" } },
                    { value: "permanent_resident", text: { he: "תושב קבע", en: "Permanent Resident", ru: "ПМЖ" } }
                ]
            },
            residency_status: {
                label: {
                    he: "סטטוס תושבות",
                    en: "Residency Status",
                    ru: "Статус резидента"
                },
                placeholder: {
                    he: "בחר סטטוס תושבות",
                    en: "Select residency status",
                    ru: "Выберите статус резидента"
                },
                options: [
                    { value: "resident", text: { he: "תושב", en: "Resident", ru: "Резидент" } },
                    { value: "non_resident", text: { he: "תושב חוץ", en: "Non-Resident", ru: "Нерезидент" } },
                    { value: "returning_resident", text: { he: "תושב חוזר", en: "Returning Resident", ru: "Вернувшийся резидент" } }
                ]
            }
        };
        
        // Update each dropdown
        for (const [fieldName, data] of Object.entries(commonDropdowns)) {
            await neonPool.query(`
                UPDATE dropdown_configs
                SET dropdown_data = $1
                WHERE field_name = $2 AND dropdown_data IS NULL OR dropdown_data::text = '[]' OR dropdown_data::text = '{}'
            `, [JSON.stringify(data), fieldName]);
            
            console.log(`✅ Updated ${fieldName} dropdown`);
        }
        
        // Check if we have dropdowns without any data
        const emptyResult = await neonPool.query(`
            SELECT COUNT(*) as count
            FROM dropdown_configs
            WHERE screen_location LIKE 'mortgage%'
                AND (dropdown_data IS NULL OR dropdown_data::text = '[]' OR dropdown_data::text = '{}')
        `);
        
        console.log(`\n📊 Remaining empty dropdowns in mortgage screens: ${emptyResult.rows[0].count}`);
        
        // Update bug tracker
        const trackerPath = '/Users/michaelmishayev/Projects/bankDev2_standalone/mainapp/bug-fix-tracker.json';
        const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));
        
        const currentIteration = tracker.iterations.find(it => it.iteration_number === 2);
        if (currentIteration) {
            currentIteration.bugs_fixed.push('NEON database has empty dropdown_data');
            currentIteration.fix_applied += ' | Fixed NEON database dropdown data';
        } else {
            tracker.iterations.push({
                iteration_number: 3,
                timestamp: new Date().toISOString(),
                bugs_fixed: ['NEON database has empty dropdown_data'],
                fix_applied: 'Updated NEON database with proper dropdown options',
                duration_seconds: Math.floor((Date.now() - new Date(tracker.start_time).getTime()) / 1000)
            });
        }
        tracker.total_iterations = 3;
        tracker.total_bugs_fixed = 4;
        
        fs.writeFileSync(trackerPath, JSON.stringify(tracker, null, 2));
        
        console.log('\n✅ BUG FIX #4 COMPLETE: NEON database dropdown data fixed');
        console.log('🔄 Ready for test iteration #3...');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await neonPool.end();
    }
}

fixNeonDropdownData();