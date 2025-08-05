import { useTranslation } from 'react-i18next'

import './Header.module.scss'

// Компонент окна входа
export default function Login() {
  const { i18n } = useTranslation()

  return <div className={'login-language'}></div>
}
