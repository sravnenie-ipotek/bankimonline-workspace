/**
 * Fallback Dropdown Data
 * Used when Railway Shortline database is unavailable
 * Critical for production stability
 */

const fallbackDropdownData = {
  mortgage_step1: {
    property_ownership: {
      en: [
        { value: 'no_property', label: "I don't own any property" },
        { value: 'has_property', label: "I own a property" },
        { value: 'selling_property', label: "I'm selling a property" }
      ],
      he: [
        { value: 'no_property', label: 'אין לי נכס' },
        { value: 'has_property', label: 'יש לי נכס' },
        { value: 'selling_property', label: 'אני מוכר נכס' }
      ],
      ru: [
        { value: 'no_property', label: 'У меня нет недвижимости' },
        { value: 'has_property', label: 'У меня есть недвижимость' },
        { value: 'selling_property', label: 'Я продаю недвижимость' }
      ]
    },
    city: {
      en: [
        { value: 'jerusalem', label: 'Jerusalem' },
        { value: 'tel_aviv', label: 'Tel Aviv' },
        { value: 'haifa', label: 'Haifa' },
        { value: 'rishon_lezion', label: 'Rishon LeZion' },
        { value: 'petah_tikva', label: 'Petah Tikva' },
        { value: 'ashdod', label: 'Ashdod' },
        { value: 'netanya', label: 'Netanya' },
        { value: 'beer_sheva', label: 'Beer Sheva' },
        { value: 'holon', label: 'Holon' },
        { value: 'bnei_brak', label: 'Bnei Brak' }
      ],
      he: [
        { value: 'jerusalem', label: 'ירושלים' },
        { value: 'tel_aviv', label: 'תל אביב' },
        { value: 'haifa', label: 'חיפה' },
        { value: 'rishon_lezion', label: 'ראשון לציון' },
        { value: 'petah_tikva', label: 'פתח תקווה' },
        { value: 'ashdod', label: 'אשדוד' },
        { value: 'netanya', label: 'נתניה' },
        { value: 'beer_sheva', label: 'באר שבע' },
        { value: 'holon', label: 'חולון' },
        { value: 'bnei_brak', label: 'בני ברק' }
      ]
    },
    building_type: {
      en: [
        { value: 'apartment', label: 'Apartment' },
        { value: 'house', label: 'House' },
        { value: 'duplex', label: 'Duplex' },
        { value: 'penthouse', label: 'Penthouse' },
        { value: 'studio', label: 'Studio' }
      ],
      he: [
        { value: 'apartment', label: 'דירה' },
        { value: 'house', label: 'בית' },
        { value: 'duplex', label: 'דופלקס' },
        { value: 'penthouse', label: 'פנטהאוז' },
        { value: 'studio', label: 'סטודיו' }
      ]
    },
    bank: {
      en: [
        { value: 'leumi', label: 'Bank Leumi' },
        { value: 'hapoalim', label: 'Bank Hapoalim' },
        { value: 'discount', label: 'Discount Bank' },
        { value: 'mizrahi', label: 'Mizrahi Tefahot Bank' },
        { value: 'first_international', label: 'First International Bank' }
      ],
      he: [
        { value: 'leumi', label: 'בנק לאומי' },
        { value: 'hapoalim', label: 'בנק הפועלים' },
        { value: 'discount', label: 'בנק דיסקונט' },
        { value: 'mizrahi', label: 'בנק מזרחי טפחות' },
        { value: 'first_international', label: 'הבנק הבינלאומי הראשון' }
      ]
    }
  },
  mortgage_step2: {
    marital_status: {
      en: [
        { value: 'single', label: 'Single' },
        { value: 'married', label: 'Married' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'widowed', label: 'Widowed' }
      ],
      he: [
        { value: 'single', label: 'רווק/ה' },
        { value: 'married', label: 'נשוי/אה' },
        { value: 'divorced', label: 'גרוש/ה' },
        { value: 'widowed', label: 'אלמן/ה' }
      ]
    },
    employment_status: {
      en: [
        { value: 'employed', label: 'Employed' },
        { value: 'self_employed', label: 'Self Employed' },
        { value: 'business_owner', label: 'Business Owner' },
        { value: 'unemployed', label: 'Unemployed' },
        { value: 'retired', label: 'Retired' }
      ],
      he: [
        { value: 'employed', label: 'שכיר' },
        { value: 'self_employed', label: 'עצמאי' },
        { value: 'business_owner', label: 'בעל עסק' },
        { value: 'unemployed', label: 'לא מועסק' },
        { value: 'retired', label: 'פנסיונר' }
      ]
    }
  },
  credit_step1: {
    loan_purpose: {
      en: [
        { value: 'personal', label: 'Personal Use' },
        { value: 'business', label: 'Business' },
        { value: 'debt_consolidation', label: 'Debt Consolidation' },
        { value: 'home_improvement', label: 'Home Improvement' },
        { value: 'education', label: 'Education' }
      ],
      he: [
        { value: 'personal', label: 'שימוש אישי' },
        { value: 'business', label: 'עסקי' },
        { value: 'debt_consolidation', label: 'איחוד הלוואות' },
        { value: 'home_improvement', label: 'שיפוץ הבית' },
        { value: 'education', label: 'השכלה' }
      ]
    }
  }
};

/**
 * Get fallback dropdown data for a specific screen and language
 * @param {string} screenName - The screen name (e.g., 'mortgage_step1')
 * @param {string} language - The language code (en, he, ru)
 * @returns {object} Formatted dropdown data
 */
function getFallbackDropdowns(screenName, language = 'en') {
  const screenData = fallbackDropdownData[screenName];
  if (!screenData) {
    return null;
  }

  const result = {};
  
  for (const [fieldName, fieldData] of Object.entries(screenData)) {
    // Get language-specific data or fall back to English
    const options = fieldData[language] || fieldData.en || [];
    result[fieldName] = options;
  }

  return result;
}

/**
 * Get all available screens with fallback data
 * @returns {string[]} Array of screen names
 */
function getAvailableScreens() {
  return Object.keys(fallbackDropdownData);
}

/**
 * Check if fallback data exists for a screen
 * @param {string} screenName - The screen name
 * @returns {boolean} True if fallback data exists
 */
function hasFallbackData(screenName) {
  return fallbackDropdownData.hasOwnProperty(screenName);
}

module.exports = {
  fallbackDropdownData,
  getFallbackDropdowns,
  getAvailableScreens,
  hasFallbackData
};