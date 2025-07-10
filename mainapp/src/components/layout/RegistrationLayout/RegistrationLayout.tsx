import React from 'react'
import { Outlet } from 'react-router-dom'
import styles from './RegistrationLayout.module.scss'

/**
 * Registration Layout Component
 * Provides a clean layout for bank employee and partner registration pages
 * without the main navigation sidebar
 */
const RegistrationLayout: React.FC = () => {
  return (
    <div className={styles.registrationLayout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <span>BankIM</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default RegistrationLayout 