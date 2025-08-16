/**
 * AdminLayout Component
 * Combines TopNavigation and SharedMenu for consistent layout across admin pages
 * 
 * Features:
 * - Comprehensive top navigation with language selector, notifications, user profile
 * - Consistent sidebar navigation with mobile menu support
 * - Responsive design with mobile menu toggle
 * - Easy integration for admin pages
 * - Proper spacing and layout management
 * - Tech support and profile menu functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavigation } from '../TopNavigation';
import { SharedMenu } from '../SharedMenu';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
  /** Page title to display in header */
  title: string;
  /** Current active menu item */
  activeMenuItem?: string;
  /** Children components to render in main content area */
  children: React.ReactNode;
  /** Custom CSS class for the layout */
  className?: string;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (itemId: string) => void;
  /** Current selected language */
  selectedLanguage?: string;
  /** Notification count */
  notificationCount?: number;
  /** User profile data */
  userProfile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    initials: string;
  };
  /** Bank context data */
  bankContext?: {
    id: string;
    name: string;
    shortName: string;
  };
}

/**
 * AdminLayout provides a consistent layout structure for all admin pages
 * Includes TopNavigation and SharedMenu with proper responsive behavior
 * Supports language switching, notifications, tech support, and user profile management
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({
  title,
  activeMenuItem = 'dashboard',
  children,
  className = '',
  onMenuItemClick,
  selectedLanguage = 'ru',
  notificationCount = 0,
  userProfile = {
    id: '1',
    name: 'Admin User',
    email: 'admin@bankim.com',
    role: 'Administrator',
    initials: 'AU'
  },
  bankContext = {
    id: '1',
    name: 'Bank Mizrahi-Tefahot',
    shortName: 'BMT'
  }
}) => {
  const navigate = useNavigate();
  const [currentActiveItem, setCurrentActiveItem] = useState(activeMenuItem);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // TopNavigation handlers
  const handleLanguageChange = (languageCode: string) => {
    console.log('Language changed to:', languageCode);
    // TODO: Implement language change logic
  };

  const handleTechSupportClick = () => {
    console.log('Tech support clicked');
    // TODO: Implement tech support logic
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
    // TODO: Implement notifications logic
  };

  const { logout, user } = useAuth();

  const handleProfileMenuClick = async (action: string) => {
    console.log('Profile menu action:', action);
    
    if (action === 'logout') {
      try {
        await logout();
        console.log('User logged out successfully');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = (itemId: string) => {
    setCurrentActiveItem(itemId);
    
    // Close mobile menu when item is clicked
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    if (onMenuItemClick) {
      onMenuItemClick(itemId);
    }

    // Handle navigation based on menu item
    switch (itemId) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'bank-employee':
        navigate('/admin/content-management');
        break;
      case 'user-registration':
        navigate('/admin/user-registration');
        break;
      case 'calculator-formula':
        navigate('/admin/calculator-formula');
        break;
      case 'chat':
        navigate('/admin/chat');
        break;
      case 'content-management':
        navigate('/admin/content-management');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      case 'logout':
        // Handle logout logic
        handleProfileMenuClick('logout');
        break;
      // Handle submenu navigation
      case 'content-main':
        navigate('/admin/content/main');
        break;
      case 'content-menu':
        navigate('/admin/content/menu');
        break;
      case 'content-mortgage':
        navigate('/admin/content/mortgage');
        break;
      case 'content-mortgage-refi':
        navigate('/admin/content/mortgage-refi');
        break;
      case 'content-credit':
        navigate('/admin/content/credit');
        break;
      case 'content-credit-refi':
        navigate('/admin/content/credit-refi');
        break;
      case 'content-general':
        navigate('/admin/content/general');
        break;
      default:
        break;
    }
  };

  // Handle window resize to close mobile menu on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1023 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('.admin-sidebar-wrapper') && !target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={`admin-layout ${className} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
        type="button"
      >
        {isMobileMenuOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      {/* Sidebar wrapper for mobile handling */}
      <div className="admin-sidebar-wrapper">
        <SharedMenu 
          activeItem={currentActiveItem}
          onItemClick={handleMenuItemClick}
        />
      </div>

      {/* Content overlay for mobile */}
      <div 
        className={`admin-content-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>
      
      <div className="admin-main-content">
        <TopNavigation
          selectedLanguage={selectedLanguage}
          notificationCount={notificationCount}
          userProfile={userProfile || (user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
          } : undefined)}
          bankContext={bankContext}
          onLanguageChange={handleLanguageChange}
          onTechSupportClick={handleTechSupportClick}
          onNotificationsClick={handleNotificationsClick}
          onProfileMenuClick={handleProfileMenuClick}
        />
        
        <main className="admin-page-content">
          {/* Show title for menu pages that don't have title in ContentPageWrapper */}
          {activeMenuItem === 'content-menu' && (
            <h1 className="admin-page-title">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;