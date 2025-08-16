/**
 * Admin Dashboard - Content Management Interface
 * Based on monorepo implementation for managing banking content and settings
 * Redirects to content-management by default
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLayout } from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      navigate('/admin/login');
      return;
    }
    
    // Redirect to content management as the default admin page
    // This matches the monorepo behavior where admin dashboard redirects to content-management
    if (!loading && user) {
      navigate('/admin/content-management', { replace: true });
    }
  }, [navigate, user, loading]);

  if (loading) {
    return (
      <AdminLayout title="Dashboard" activeMenuItem="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-2 text-gray-300">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // This should not render as it redirects to content-management
  return (
    <AdminLayout title="Dashboard" activeMenuItem="dashboard">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-300">Redirecting to content management...</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;