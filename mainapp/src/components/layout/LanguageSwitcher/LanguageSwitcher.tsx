import { useTranslation } from 'react-i18next'

import CustomSelect from '../LanguageSelect/CustomSelect.tsx'
import './LanguageSwitcher.css'

interface LanguageOption {
  value: string
  label: string
}

interface LanguagesOptions {
  ru: LanguageOption[]
  he: LanguageOption[]
  en: LanguageOption[]
}

const languagesOptions: LanguagesOptions = {
  ru: [
    { value: 'ru', label: 'Россия' },
    { value: 'he', label: 'Израиль' },
    { value: 'en', label: 'США' },
  ],
  he: [
    { value: 'ru', label: 'רוּסִיָה' },
    { value: 'he', label: 'ישראל' },
    { value: 'en', label: 'ארצות הברית' },
  ],
  en: [
    { value: 'ru', label: 'Russia' },
    { value: 'he', label: 'Israel' },
    { value: 'en', label: 'United States' },
  ],
}

interface Props {
  className?: string
  onChange: (value: { value: string }) => void
  lang?: string
  index?: number
}

export default function LanguageSwitcher({ className = '', onChange }: Props) {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.split('-')[0]
  const languageOptions =
    languagesOptions[currentLang as keyof LanguagesOptions]

  const selectedLangOption = languageOptions?.find(
    (option: { value: string }) => option.value === currentLang
  )

  return (
    <div className={`language-switcher-${currentLang} ${className}`}>
      <div className={`flag-background flag-${currentLang}`}>
        <CustomSelect
          name={`flag-${currentLang}`}
          placeholder=""
          options={languageOptions}
          values={[selectedLangOption!]}
          direction="ltr"
          onChange={(value) => onChange(value)}
          style={{ paddingLeft: '3rem' }}
        />
      </div>
    </div>
  )
}
