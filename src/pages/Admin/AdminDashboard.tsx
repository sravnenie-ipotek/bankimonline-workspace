/**
 * Admin Dashboard
 * Simplified version for testing
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Load admin profile and stats
    loadAdminData(token);
  }, [navigate]);

  const loadAdminData = async (token: string) => {
    try {
      const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8003/api';
      
      // Get admin profile
      const profileResponse = await fetch(`${API_BASE}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData.data.admin);
      }

      // Get stats
      const statsResponse = await fetch(`${API_BASE}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔄</div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-indigo-600">
                🏦 BankimOnline Admin
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.name}</span>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="text-green-800">
            <h3 className="font-medium">🎉 Admin Panel Working!</h3>
            <p className="text-sm mt-1">
              Phase 1 implementation successful. Admin authentication and dashboard are functional.
            </p>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of system statistics and quick actions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Clients
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalClients}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🏦</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Banks
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalBanks}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📋</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Applications
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalApplications}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👨‍💼</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Admin Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalAdmins}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Phase 1 Complete ✅
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">✅ Working Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Admin authentication</li>
                  <li>• JWT token management</li>
                  <li>• Dashboard statistics</li>
                  <li>• Route protection</li>
                  <li>• Database integration</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🚧 Coming in Phase 2</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Calculation editing</li>
                  <li>• Bank management</li>
                  <li>• User management</li>
                  <li>• Settings panel</li>
                  <li>• Reports & analytics</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-700">
                <p className="font-medium">🎯 Phase 1 Status: COMPLETE</p>
                <p className="mt-1">
                  Admin authentication and basic dashboard are working. 
                  Ready to proceed to Phase 2 for calculation management features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;