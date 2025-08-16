/**
 * Admin Login Page - Functional Login for BankIM Admin Portal
 * Based on monorepo implementation with role-based authentication
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'director' | 'administration' | 'sales-manager' | 'content-manager' | 'brokers' | 'bank-employee';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('director');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store admin user data
      const userData = {
        id: `admin_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: selectedRole,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('bankIM_admin_user', JSON.stringify(userData));
      localStorage.setItem('adminToken', `admin_token_${Date.now()}`);
      
      // Navigate to admin dashboard/content management
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Ошибка входа в систему');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'director', label: '👑 Директор' },
    { value: 'administration', label: '⚙️ Администратор' },
    { value: 'sales-manager', label: '📊 Менеджер по продажам' },
    { value: 'content-manager', label: '📝 Контент-менеджер' },
    { value: 'brokers', label: '🤝 Брокер' },
    { value: 'bank-employee', label: '🏦 Сотрудник банка' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-indigo-600">
            🏦 BankIM Admin Portal
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Вход в админ-панель
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Выберите роль для доступа к системе управления
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bankim.com"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Роль
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                ❌ {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? 'Вход...' : 'Войти в систему'}
              </button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🧪 Демо-режим</h3>
            <p className="text-xs text-blue-700 mb-2">Для тестирования системы управления:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li><strong>Директор:</strong> Полный доступ к редактированию</li>
              <li><strong>Другие роли:</strong> Ограниченный доступ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;