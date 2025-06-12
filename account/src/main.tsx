import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'

import i18n from '../utils/i18n'
import App from './app/App.tsx'
import './index.scss'
import store from './store'

// Loading component while i18n loads
const Loading = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px'
  }}>
    Loading...
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Suspense fallback={<Loading />}>
          <App />
        </Suspense>
      </Provider>
    </I18nextProvider>
  </React.StrictMode>
)
