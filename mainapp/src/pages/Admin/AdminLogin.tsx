/**
 * Admin Login Page - Redirects to New Admin Panel
 * This component is deprecated and redirects to the new standalone admin interface
 */

import React, { useEffect } from 'react';

const AdminLogin: React.FC = () => {
  useEffect(() => {
    // Automatically redirect to the new admin panel
    const redirectUrl = 'http://localhost:3001/admin-panel';
    
    // Show message for 3 seconds then redirect
    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualRedirect = () => {
    window.location.href = 'http://localhost:3001/admin-panel';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="text-3xl font-bold text-indigo-600">
            🏦 BankimOnline
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Panel Moved
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The admin interface has been moved to a new location
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Redirect Notice */}
          <div className="text-center">
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">🔄 Redirecting to New Admin Panel</p>
                <p>The admin interface has been moved to:</p>
                <p className="font-mono text-xs mt-2 p-2 bg-blue-100 rounded">
                  http://localhost:3001/admin-panel
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 rounded-md">
              <div className="text-sm text-yellow-700">
                <p className="font-medium">⚡ Automatic Redirect</p>
                <p>You will be redirected automatically in 3 seconds...</p>
              </div>
            </div>

            {/* Manual Redirect Button */}
            <button
              onClick={handleManualRedirect}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to New Admin Panel Now
            </button>

            <div className="mt-4 text-xs text-gray-500">
              <p>If you are not redirected automatically, click the button above</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;