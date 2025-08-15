import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames/bind'

import { SharedSideNavigation } from '@src/components/layout/SharedSideNavigation'

import styles from './SideNavigationDemo.module.scss'

const cx = classNames.bind(styles)

/**
 * Demo Page for SharedSideNavigation Component
 * Tests all 9 actions from Confluence documentation
 */
const SideNavigationDemo: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')

  // Mock bank logo
  const mockBankLogo = {
    src: '/static/artwork.svg', // Using existing logo from static folder
    alt: 'Bankimonline Logo',
    name: 'Bankimonline'
  }

  // Handle navigation actions
  const handleNavigate = (path: string, id: string) => {
    console.log(`Navigation to ${path} with id ${id}`)
    setCurrentPage(id)
    // In a real app, you would use navigate(path) here
  }

  // Handle logout action
  const handleLogout = () => {
    alert('Logout functionality triggered!')
  }

  // Mock current path based on selected page
  const getCurrentPath = () => {
    switch (currentPage) {
      case 'home': return '/admin/dashboard'
      case 'clients': return '/admin/clients'
      case 'offers': return '/admin/offers'
      case 'bank_programs': return '/admin/bank-programs'
      case 'audience_creation': return '/admin/audience-creation'
      case 'chat': return '/admin/chat'
      case 'settings': return '/admin/settings'
      default: return '/admin/dashboard'
    }
  }

  // Page content based on current selection
  const renderPageContent = () => {
    const pageMapping = {
      home: {
        title: 'Главная страница',
        content: 'Добро пожаловать в панель управления банковского сотрудника. Здесь отображается основная информация и статистика.'
      },
      clients: {
        title: 'Клиенты',
        content: 'Управление клиентской базой. Просмотр информации о клиентах, их заявок и истории взаимодействий.'
      },
      offers: {
        title: 'Предложения',
        content: 'Управление банковскими предложениями и продуктами. Создание и редактирование предложений для клиентов.'
      },
      bank_programs: {
        title: 'Банковские программы',
        content: 'Настройка и управление банковскими программами. Ипотечные и кредитные программы.'
      },
      audience_creation: {
        title: 'Создание аудитории',
        content: 'Инструменты для создания и сегментации клиентской аудитории для таргетированных предложений.'
      },
      chat: {
        title: 'Чат',
        content: 'Система обмена сообщениями с клиентами и коллегами. Поддержка клиентов в реальном времени.'
      },
      settings: {
        title: 'Настройки',
        content: 'Настройки системы и персональные настройки сотрудника банка.'
      }
    }

    const page = pageMapping[currentPage as keyof typeof pageMapping] || pageMapping.home

    return (
      <div className={cx('page-content')}>
        <h1 className={cx('page-title')}>{page.title}</h1>
        <p className={cx('page-description')}>{page.content}</p>
        
        <div className={cx('demo-info')}>
          <h3>Информация о демо:</h3>
          <ul>
            <li><strong>Текущая страница:</strong> {currentPage}</li>
            <li><strong>Путь:</strong> {getCurrentPath()}</li>
            <li><strong>Боковая панель:</strong> {isCollapsed ? 'Свернута' : 'Развернута'}</li>
          </ul>
        </div>

        <div className={cx('demo-actions')}>
          <button 
            className={cx('demo-button')}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? 'Развернуть' : 'Свернуть'} боковую панель
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cx('side-navigation-demo')}>
      {/* SharedSideNavigation Component */}
      <SharedSideNavigation
        currentPath={getCurrentPath()}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        bankLogo={mockBankLogo}
        className={cx('demo-sidebar')}
      />

      {/* Main Content Area */}
      <main className={cx('main-content', { 'main-content--collapsed': isCollapsed })}>
        <header className={cx('demo-header')}>
          <h1>Демо компонента SharedSideNavigation</h1>
          <p>Тестирование всех 9 действий из документации Confluence</p>
        </header>

        {renderPageContent()}

        <footer className={cx('demo-footer')}>
          <p>
            Этот компонент реализует боковую навигацию для сотрудников банка согласно 
            спецификации Figma и требованиям из Confluence.
          </p>
        </footer>
      </main>
    </div>
  )
}

export default SideNavigationDemo