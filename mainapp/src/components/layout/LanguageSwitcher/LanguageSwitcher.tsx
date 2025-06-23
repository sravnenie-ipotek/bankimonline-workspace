import { useTranslation } from 'react-i18next'

import CustomSelect from '../LanguageSelect/CustomSelect.tsx'
import './LanguageSwitcher.css'

interface LanguageOption {
  value: string
  label: string
}

// This will be generated dynamically based on current language
const getLanguageOptions = (t: any): LanguageOption[] => [
  { value: 'ru', label: t('country_russia') },
  { value: 'he', label: t('country_israel') },
  { value: 'en', label: t('country_us') },
]

interface Props {
  className?: string
  onChange: (value: { value: string }) => void
  lang?: string
  index?: number
}

export default function LanguageSwitcher({ className = '', onChange }: Props) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.split('-')[0]
  const languageOptions = getLanguageOptions(t)

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
