/**
 * Admin Dashboard - Content Management Interface
 * Based on monorepo implementation for managing banking content and settings
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from './AdminLogin';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  loginTime: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const adminUserData = localStorage.getItem('bankIM_admin_user');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminUserData || !adminToken) {
      navigate('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(adminUserData);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing admin user data:', error);
      navigate('/admin/login');
      return;
    }
    
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bankIM_admin_user');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const getRolePermissions = (role: UserRole) => {
    switch (role) {
      case 'director':
        return 'Полный доступ ко всем функциям';
      case 'administration':
        return 'Управление пользователями и система';
      case 'content-manager':
        return 'Управление контентом и медиа';
      case 'sales-manager':
        return 'Управление продажами и клиентами';
      case 'brokers':
        return 'Доступ к программам партнеров';
      case 'bank-employee':
        return 'Управление документами и контентом';
      default:
        return 'Базовый доступ';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'director': return '👑';
      case 'administration': return '⚙️';
      case 'content-manager': return '📝';
      case 'sales-manager': return '📊';
      case 'brokers': return '🤝';
      case 'bank-employee': return '🏦';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">
                🏦 BankIM Admin Portal
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Добро пожаловать, <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* User Info Panel */}
        <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="text-4xl mr-4">{getRoleIcon(user.role)}</div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Панель управления - {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {getRolePermissions(user.role)}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Вход: {new Date(user.loginTime).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Content Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
               onClick={() => window.open('/admin/content-management', '_blank')}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📝</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Управление контентом</h3>
                  <p className="text-sm text-gray-500">Редактирование содержимого сайта и переводов</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Settings */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
               onClick={() => window.open('/admin/calculator-settings', '_blank')}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🧮</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Настройки калькулятора</h3>
                  <p className="text-sm text-gray-500">Формулы расчета и параметры банковских продуктов</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          {(user.role === 'director' || user.role === 'administration') && (
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => window.open('/admin/users', '_blank')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">👥</div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Управление пользователями</h3>
                    <p className="text-sm text-gray-500">Роли и права доступа сотрудников</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
               onClick={() => window.open('/admin/analytics', '_blank')}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">📊</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Аналитика</h3>
                  <p className="text-sm text-gray-500">Статистика использования и отчеты</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Programs */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
               onClick={() => window.open('/admin/bank-programs', '_blank')}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl">🏛️</div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Банковские программы</h3>
                  <p className="text-sm text-gray-500">Ипотечные и кредитные продукты</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          {(user.role === 'director' || user.role === 'administration') && (
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => window.open('/admin/settings', '_blank')}>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-3xl">⚙️</div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Системные настройки</h3>
                    <p className="text-sm text-gray-500">Конфигурация системы и безопасность</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Статус системы</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800">Фронтенд</div>
                <div className="text-lg font-bold text-green-600">🟢 Онлайн</div>
                <div className="text-xs text-green-600">localhost:4003</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800">API сервер</div>
                <div className="text-lg font-bold text-green-600">🟢 Онлайн</div>
                <div className="text-xs text-green-600">localhost:8004</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800">База данных</div>
                <div className="text-lg font-bold text-green-600">🟢 Подключена</div>
                <div className="text-xs text-green-600">PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;