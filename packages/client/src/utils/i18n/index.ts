import i18n, { InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

// Define supported languages locally for now
const SUPPORTED_LANGUAGES = ['en', 'he', 'ru']

// Temporary translations for testing - these would be loaded from shared package in production
const enTranslations = {
  "application_submitted_title": "Application Submitted Successfully",
  "application_submitted_description": "Our representatives will contact you soon with bank responses",
  "go_to_correspondence": "Go to Correspondence",
  "refund_title": "Refund Policy",
  "refund_text": "**Refund Conditions**\\n\\nFor the use of our consulting services and conducting an interest rate tender, the amount to be paid is 3,850 New Israeli Shekels including VAT as required by law (hereinafter: \\\"the fee\\\"). Payment is required before the start of service provision, and payment is made for the service provided to you by Bankimonline.\\n\\n**1.** Upon completion of the tender between the banks, we will notify you of this through one of the contact details you provided to Bankimonline (for example: email, SMS message to mobile phone, etc.), and we will refer you to the relevant bank to complete the mortgage approval process.\\n\\n**2.** You may try to obtain independently and in an official document from the bank a better offer than the best offer obtained for you, and for this you will be given a period of seven days from the date of receiving the notice of completion of the tender activity.\\n\\n**3.** For the purposes of the above, \\\"the best offer\\\" means that the total cost of the loan is the lowest among the offers received from all the banks that participated in the tender, taking into account the interest rate, linkage, loan fees, and early repayment fees.\\n\\n**4.** If you succeed in obtaining a better offer as mentioned above and you provide us with written proof of this within seven days, we will refund the full amount paid to us. A \\\"better offer\\\" is an offer that offers better conditions in terms of total loan cost than what we obtained for you through the tender.\\n\\n**5.** If you do not provide us with written proof of a better offer within seven days as mentioned above, we will not refund the amount paid.\\n\\n**6.** The refund, if relevant, will be made to the same payment method used for the original payment, within 14 business days of receiving the written proof of the better offer.\\n\\n**Contact Information:**\\nFor any questions regarding refunds: info@bankimonline.com\\nPhone: +972 04-623-2280\\n\\n**This refund policy is effective from the date of service provision and is subject to the terms of service and privacy policy of Bankimonline.**",
  "back": "Back"
}

const heTranslations = {
  "application_submitted_title": "הבקשה נשלחה בהצלחה",
  "application_submitted_description": "נציגינו יצרו איתך קשר בקרוב",
  "go_to_correspondence": "מעבר להתכתבויות",
  "refund_title": "מדיניות החזרים",
  "refund_text": "**תנאי החזר**\n\nעבור השימוש בשירותי הייעוץ שלנו וביצוע מכרז ריביות, הסכום לתשלום הוא 3,850 שקלים חדשים כולל מע\"מ כנדרש בחוק (להלן: \"העמלה\"). התשלום נדרש לפני תחילת מתן השירות, והתשלום מבוצע עבור השירות הניתן לכם על ידי Bankimonline.\n\n**1.** עם השלמת המכרז בין הבנקים, נודיע לכם על כך באמצעות אחד מפרטי הקשר שמסרתם ל-Bankimonline (לדוגמה: דואר אלקטרוני, הודעת SMS לטלפון נייד וכו'), ונפנה אתכם לבנק הרלוונטי להשלמת תהליך אישור המשכנתא.\n\n**2.** תוכלו לנסות לקבל באופן עצמאי ובמסמך רשמי מהבנק הצעה טובה יותר מההצעה הטובה ביותר שהושגה עבורכם, ולכך תינתן לכם תקופה של שבעת ימים ממועד קבלת ההודעה על סיום פעילות המכרז.\n\n**3.** לצורכי האמור לעיל, \"ההצעה הטובה ביותר\" פירושה שסכום תשלומי המשכנתא הכולל עליו תסכימו עם הבנק יהיה נמוך בלפחות 10,000 שקלים חדשים מסכום התשלומים הכולל של ההצעה הטובה ביותר שהשגנו עבורכם, או 1% מסכום המשכנתא, הגבוה מביניהם, הכל על בסיס אותה משכנתא מעורבת.\n\n**4.** במקרה האמור לעיל, ואם ההצעה שקיבלתם היא הצעה טובה יותר, יהיו לנו שבעת ימים לנסות לשפר את ההצעה הטובה ביותר שקיבלתם, ובמידה ולא נוכל לשפר את ההצעה שקיבלתם, נחזיר לכם את מלוא העלות.\n\n**הבהרה חשובה**\n\nיובהר כי במצב שבו במסגרת מכרז הריביות שאנו עורכים עבורכם, נקבל סירובים מהבנקים המשתתפים במכרז לתת לכם אישור עקרוני שאינו תושב לבחינה.\n\n*עדכון אחרון: 07.07.2021*",
  "back": "חזור"
}

const ruTranslations = {
  "application_submitted_title": "Заявка успешно отправлена",
  "application_submitted_description": "Наши представители свяжутся с вами в ближайшее время",
  "go_to_correspondence": "Перейти к переписке",
  "refund_title": "Политика возвратов",
  "refund_text": "**Условия возврата**\n\nЗа использование наших консультационных услуг и проведение тендера по процентным ставкам сумма к оплате составляет 3,850 новых израильских шекелей, включая НДС, как требуется по закону (далее: \"комиссия\"). Оплата требуется до начала предоставления услуг, и оплата производится за услугу, предоставляемую вам Bankimonline.\n\n**1.** По завершении тендера между банками мы уведомим вас об этом через один из контактных данных, которые вы предоставили Bankimonline (например: электронная почта, SMS-сообщение на мобильный телефон и т.д.), и направим вас в соответствующий банк для завершения процесса одобрения ипотеки.\n\n**2.** Вы можете попытаться получить самостоятельно и в официальном документе от банка лучшее предложение, чем лучшее предложение, полученное для вас, и для этого вам будет предоставлен период в семь дней с даты получения уведомления о завершении тендера.\n\n**3.** Для целей вышеизложенного \"лучшее предложение\" означает, что общая сумма платежей по ипотеке, на которую вы согласитесь с банком, будет ниже как минимум на 10,000 новых израильских шекелей от общей суммы платежей лучшего предложения, которое мы получили для вас, или на 1% от суммы ипотеки, в зависимости от того, что больше, все на основе той же смешанной ипотеки.\n\n**4.** В вышеуказанном случае, и если полученное вами предложение является лучшим предложением, у нас будет семь дней, чтобы попытаться улучшить лучшее предложение, которое вы получили, и в той мере, в какой мы не сможем улучшить полученное вами предложение, мы вернем вам полную стоимость.\n\n**Важное разъяснение**\n\nСледует прояснить, что в ситуации, когда в рамках тендера по процентным ставкам, который мы проводим для вас, мы получаем отказы от банков, участвующих в тендере, предоставить вам принципиальное одобрение, которое не является резидентом для рассмотрения.\n\n*Последнее обновление: 07.07.2021*",
  "back": "Назад"
}

// Get language from localStorage or default to Hebrew
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_language') || localStorage.getItem('language') || 'he'
  }
  return 'he'
}

const i18nConfig: InitOptions = {
  lng: getInitialLanguage(),
  fallbackLng: 'he', // Hebrew as fallback
  debug: process.env.NODE_ENV === 'development',
  
  interpolation: {
    escapeValue: false, // React already escapes
  },
  
  resources: {
    en: {
      translation: enTranslations,
    },
    he: {
      translation: heTranslations,
    },
    ru: {
      translation: ruTranslations,
    },
  },
  
  ns: ['translation'],
  defaultNS: 'translation',
  
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
  },
  
  returnEmptyString: false,
  returnNull: false,
  
  // Handle missing translations
  missingKeyHandler: (lng, ns, key) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔍 [CLIENT] Missing translation key: "${key}" for language: "${lng}"`)
    }
    return key // Return the key itself as fallback
  },
}

// Initialize i18n
i18n
  .use(initReactI18next)
  .init(i18nConfig)
  .then(() => {
    console.log('✅ [CLIENT] i18n initialized successfully')
    console.log('🔍 [CLIENT] Current language:', i18n.language)
    console.log('🔍 [CLIENT] Available languages:', SUPPORTED_LANGUAGES)
    
    // Test critical translations for ApplicationSubmitted
    const testKeys = [
      'application_submitted_title',
      'application_submitted_description',
      'go_to_correspondence'
    ]
    
    testKeys.forEach(key => {
      const translation = i18n.t(key)
      console.log(`🧪 [CLIENT] "${key}" = "${translation}"`)
      if (translation === key) {
        console.warn(`⚠️ [CLIENT] Translation key "${key}" not found!`)
      }
    })
  })
  .catch((error) => {
    console.error('❌ [CLIENT] i18n initialization failed:', error)
  })

// Event listeners for debugging
i18n.on('languageChanged', (lng) => {
  console.log('🔄 [CLIENT] Language changed to:', lng)
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng)
    localStorage.setItem('admin_language', lng)
  }
  
  // Update document direction
  document.body.className = lng === 'he' ? 'rtl' : 'ltr'
  document.dir = lng === 'he' ? 'rtl' : 'ltr'
})

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`❌ [CLIENT] Failed loading ${lng}/${ns}: ${msg}`)
})

export default i18n