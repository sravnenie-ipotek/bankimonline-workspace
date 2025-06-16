import { jsx as _jsx } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import CustomSelect from '../LanguageSelect/CustomSelect.tsx';
import './LanguageSwitcher.css';
const languagesOptions = {
    ru: [
        { value: 'ru', label: 'Россия' },
        { value: 'he', label: 'Израиль' },
    ],
    he: [
        { value: 'ru', label: 'רוּסִיָה' },
        { value: 'he', label: 'ישראל' },
    ],
};
export default function LanguageSwitcher({ className = '', onChange }) {
    const { i18n } = useTranslation();
    const currentLang = i18n.language?.split('-')[0];
    const languageOptions = languagesOptions[currentLang];
    const selectedLangOption = languageOptions?.find((option) => option.value === currentLang);
    return (_jsx("div", { className: `language-switcher-${currentLang} ${className}`, children: _jsx("div", { className: `flag-background flag-${currentLang}`, children: _jsx(CustomSelect, { name: `flag-${currentLang}`, placeholder: "", options: languageOptions, values: [selectedLangOption], direction: "ltr", onChange: (value) => onChange(value), style: { paddingLeft: '3rem' } }) }) }));
}
