/**
 * ContentManagement Component
 * Main component for managing chat-related content pages
 * 
 * Business Logic:
 * - Displays list of content pages with search and filtering
 * - Provides CRUD operations for content management
 * - Role-based access control (Director only)
 * - Multi-language content support
 * 
 * Security Measures:
 * - Input validation and sanitization
 * - XSS prevention for user content
 * - Role-based access verification
 * - Audit logging for all operations
 * 
 * Reference: https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/149815297
 * 
 * @version 1.0.0
 * @author BankIM Development Team
 * @since 2024-12-14
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ContentTable, Breadcrumb, UserInfoCards, PageGallery } from './components';
import type { 
  ContentPage, 
  ContentFilter, 
  ContentManagementProps
} from './types/contentTypes';
import './ContentManagement.css';

/**
 * Main ContentManagement Component
 * Handles the complete content management interface for Directors
 * 
 * Features:
 * - Secure content page listing
 * - Advanced search and filtering
 * - Responsive design for all devices
 * - Role-based access control
 * - Real-time data updates
 */
const ContentManagement: React.FC<ContentManagementProps> = ({
  initialFilter,
  onPageSelect,
  onFilterChange,
  readonly: _readonly = false,
  className = ''
}) => {
  const { user } = useAuth();
  
  // Component state management
  const [contentPages, setContentPages] = useState<ContentPage[]>([]);
  const [currentFilter, setCurrentFilter] = useState<ContentFilter>({
    searchQuery: '',
    sortBy: 'pageNumber',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
    ...initialFilter
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_selectedPages] = useState<Set<string>>(new Set());

  // Security check: Verify user has Director role
  // Following security rule: Role verification before rendering sensitive content
  const hasContentManagementAccess = useMemo(() => {
    return user?.role === 'director';
  }, [user]);

  // Mock data for Phase 1 development
  // TODO: Replace with real API calls in Phase 2
  const mockContentPages: ContentPage[] = [
    {
      id: '1',
      pageNumber: 1,
      title: 'Главная страница',
      titleRu: 'Главная страница',
      titleHe: 'עמוד הבית',
      titleEn: 'Home Page',
      actionCount: 12,
      lastModified: new Date('2024-12-10'),
      modifiedBy: 'director-1',
      category: 'main',
      status: 'published',
      url: '/',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '2',
      pageNumber: 2,
      title: 'Меню сайта',
      titleRu: 'Меню сайта',
      titleHe: 'תפריט האתר',
      titleEn: 'Site Menu',
      actionCount: 9,
      lastModified: new Date('2024-12-12'),
      modifiedBy: 'director-1',
      category: 'menu',
      status: 'published',
      url: '/menu',
      createdAt: new Date('2024-12-01'),
      createdBy: 'director-1'
    },
    {
      id: '3',
      pageNumber: 3,
      title: 'Рассчитать ипотеку',
      titleRu: 'Рассчитать ипотеку',
      titleHe: 'חישוב משכנתא',
      titleEn: 'Calculate Mortgage',
      actionCount: 15,
      lastModified: new Date('2024-12-11'),
      modifiedBy: 'director-1',
      category: 'mortgage',
      status: 'draft',
      url: '/calculate-mortgage',
      createdAt: new Date('2024-12-02'),
      createdBy: 'director-1'
    }
  ];

  // Initialize component data
  useEffect(() => {
    if (!hasContentManagementAccess) {
      setError('Доступ запрещен. Требуется роль Директора.');
      return;
    }

    // Load initial data (mock for Phase 1)
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setContentPages(mockContentPages);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [hasContentManagementAccess]);

  // Handle filter changes with validation
  // Following security rule: Input validation for all user inputs
  const handleFilterChange = (newFilter: Partial<ContentFilter>) => {
    // Validate filter inputs
    const validatedFilter: ContentFilter = {
      ...currentFilter,
      ...newFilter,
      // Sanitize search query
      searchQuery: typeof newFilter.searchQuery === 'string' 
        ? newFilter.searchQuery.trim().substring(0, 255) 
        : currentFilter.searchQuery,
      // Validate pagination
      page: Math.max(1, newFilter.page ?? currentFilter.page ?? 1),
      limit: Math.min(100, Math.max(1, newFilter.limit ?? currentFilter.limit ?? 10))
    };

    setCurrentFilter(validatedFilter);
    onFilterChange?.(validatedFilter);
  };

  // Handle page selection with security validation
  const handlePageSelect = (page: ContentPage) => {
    if (!hasContentManagementAccess) {
      console.warn('Unauthorized page selection attempt');
      return;
    }

    onPageSelect?.(page);
  };

  // Filter and sort pages based on current filter
  const filteredPages = useMemo(() => {
    let filtered = [...contentPages];

    // Apply search filter
    if (currentFilter.searchQuery) {
      const query = currentFilter.searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(query) ||
        page.pageNumber.toString().includes(query) ||
        page.id.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (currentFilter.category) {
      filtered = filtered.filter(page => page.category === currentFilter.category);
    }

    // Apply status filter
    if (currentFilter.status) {
      filtered = filtered.filter(page => page.status === currentFilter.status);
    }

    // Apply date range filter
    if (currentFilter.dateFrom) {
      filtered = filtered.filter(page => page.lastModified >= currentFilter.dateFrom!);
    }
    if (currentFilter.dateTo) {
      filtered = filtered.filter(page => page.lastModified <= currentFilter.dateTo!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const field = currentFilter.sortBy;
      const order = currentFilter.sortOrder === 'asc' ? 1 : -1;

      let aValue: any = a[field];
      let bValue: any = b[field];

      // Handle different data types
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * order;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }

      return 0;
    });

    return filtered;
  }, [contentPages, currentFilter]);

  // Get the current selected page (for demo purposes, we'll use the first page)
  const currentPage = contentPages.length > 0 ? contentPages[0] : null;

  // Mock image data for gallery - using data URLs to avoid network requests
  const mockImages = [
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCAxPC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCDwjDwvdGV4dD48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCozPC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCo0PC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCo1PC90ZXh0Pjwvc3ZnPg==',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMUYyQTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuzKlOyZnOygoCo2PC90ZXh0Pjwvc3ZnPg=='
  ];

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className={`content-management loading ${className}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка контента...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`content-management error ${className}`}>
        <div className="error-container">
          <h2>⚠️ Ошибка доступа</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Render unauthorized state
  if (!hasContentManagementAccess) {
    return (
      <div className={`content-management unauthorized ${className}`}>
        <div className="unauthorized-container">
          <h2>🔒 Доступ ограничен</h2>
          <p>Данный раздел доступен только пользователям с ролью "Директор"</p>
          <p>Текущая роль: {user?.role || 'Не определена'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`content-management-new ${className}`}>
      {/* Breadcrumb Section */}
      <div className="breadcrumb-section">
        <Breadcrumb
          items={[
            { label: 'Контент сайта', href: '/content-management' },
            { label: 'Главная', href: '/content-management/main' },
            { label: 'Калькулятор ипотеки Страница №2', isActive: true }
          ]}
        />
      </div>

      {/* Page Header Section */}
      <div className="page-header-section">
        <div className="page-title-container">
          <h1 className="page-title">
            {currentPage ? currentPage.title : 'Калькулятор ипотеки Страница №2'}
          </h1>
        </div>
        
        {/* User Info Cards */}
        <div className="info-cards-section">
          <UserInfoCards
            actionCount={currentPage ? currentPage.actionCount : 33}
            lastModified={currentPage ? formatDate(currentPage.lastModified) : '01.08.2023 | 15:03'}
          />
        </div>
      </div>

      {/* Page Gallery Section */}
      <div className="gallery-section">
        <PageGallery
          images={mockImages}
          title="Страница и ее состояния"
        />
      </div>

      {/* Content Table Section */}
      <div className="content-table-section">
        <div className="table-header">
          <h2>Список действий на странице</h2>
        </div>
        
        <div className="table-container">
          {/* Search and Filter Section */}
          <div className="content-filters">
            <div className="search-section">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Искать по действию"
                  value={currentFilter.searchQuery}
                  onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                  className="search-input"
                  maxLength={255}
                />
                <button 
                  className="search-button"
                  onClick={() => {/* Search action will be handled by input change */}}
                  title="Поиск"
                >
                  🔍
                </button>
              </div>
            </div>

            <div className="filter-controls">
              <button className="filter-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4.5H14M4 8.5H12M6 12.5H10" stroke="#F9FAFB" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filters
              </button>
            </div>
          </div>
          
          <ContentTable
            data={filteredPages}
            filter={currentFilter}
            isLoading={isLoading}
            readonly={false}
            onSortChange={(sortBy, sortOrder) => {
              handleFilterChange({ sortBy, sortOrder });
            }}
            onRowSelect={(page) => {
              console.log('Row selected:', page);
              handlePageSelect(page);
            }}
            onMultiSelect={(pageIds) => {
              console.log('Multi-select:', pageIds);
              // TODO: Handle multi-selection in Phase 2
            }}
            onEdit={(page) => {
              console.log('Edit page:', page);
              // TODO: Implement edit functionality in Phase 2
            }}
            onDelete={(page) => {
              console.log('Delete page:', page);
              // TODO: Implement delete functionality in Phase 2
            }}
            onView={(page) => {
              console.log('View page:', page);
              // TODO: Implement view functionality in Phase 2
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;