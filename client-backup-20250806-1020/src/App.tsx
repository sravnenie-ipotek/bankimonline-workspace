import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// Import migrated pages
import ApplicationSubmitted from './pages/ApplicationSubmitted'
import ServicesOverview from './pages/ServicesOverview'
import Terms from './pages/Terms'
import Cookie from './pages/Cookie'
import Refund from './pages/Refund'
import TextPage from './components/ui/TextPage'

const App: React.FC = () => {
  const { i18n } = useTranslation()

  // Apply RTL class for Hebrew
  React.useEffect(() => {
    document.body.className = i18n.language === 'he' ? 'rtl' : 'ltr'
    document.dir = i18n.language === 'he' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <div className="app">
      <Routes>
        {/* Migrated Services */}
        <Route path="/services/application-submitted" element={<ApplicationSubmitted />} />
        <Route path="/services" element={<ServicesOverview />} />
        <Route path="/services/overview" element={<ServicesOverview />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookie" element={<Cookie />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/test-textpage" element={<TextPage title="Test TextPage Component" text="This is a test of the TextPage component. It should display properly with a back button and proper styling." />} />
        
        {/* Default route */}
        <Route path="/" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Banking Client - Migration in Progress</h1>
            <p>Available services:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>• ServicesOverview: <a href="/services">/services</a></li>
              <li>• ApplicationSubmitted: <a href="/services/application-submitted">/services/application-submitted</a></li>
              <li>• Terms: <a href="/terms">/terms</a></li>
              <li>• Cookie: <a href="/cookie">/cookie</a></li>
              <li>• Refund: <a href="/refund">/refund</a></li>
              <li>• TextPage (Test): <a href="/test-textpage">/test-textpage</a></li>
            </ul>
          </div>
        } />
        
        {/* 404 fallback */}
        <Route path="*" element={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <p>This service has not been migrated yet.</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App