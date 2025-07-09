/**
 * Admin Dashboard - Redirects to New Admin Panel
 * This component is deprecated and redirects to the new standalone admin interface
 */

import React, { useEffect } from 'react';

const AdminDashboard: React.FC = () => {
  useEffect(() => {
    // Automatically redirect to the new admin panel
    const redirectUrl = 'http://localhost:3001/admin-panel';
    
    // Show message for 2 seconds then redirect
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'http://localhost:3001/admin-panel';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              🏦 BankimOnline
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
              Admin Dashboard Moved
            </h2>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">🔄 Redirecting to New Admin Panel</p>
                <p>The admin dashboard has been moved to:</p>
                <p className="font-mono text-xs mt-2 p-2 bg-blue-100 rounded">
                  http://localhost:3001/admin-panel
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-green-50 rounded-md">
              <div className="text-sm text-green-700">
                <p className="font-medium">✨ Enhanced Features</p>
                <p>The new admin panel includes improved UI, better performance, and new banking management tools.</p>
              </div>
            </div>

            <button
              onClick={handleManualRedirect}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to New Admin Panel
            </button>

            <div className="mt-4 text-xs text-gray-500">
              <p>Redirecting automatically in 2 seconds...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;