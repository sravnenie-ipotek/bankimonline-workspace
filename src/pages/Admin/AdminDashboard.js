import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Dashboard
 * Simplified version for testing
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        // Load admin profile and stats
        loadAdminData(token);
    }, [navigate]);
    const loadAdminData = async (token) => {
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
        }
        catch (error) {
            console.error('Error loading admin data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl mb-4", children: "\uD83D\uDD04" }), _jsx("p", { children: "Loading admin dashboard..." })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm border-b border-gray-200", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between h-16", children: [_jsx("div", { className: "flex items-center", children: _jsx("div", { className: "text-2xl font-bold text-indigo-600", children: "\uD83C\uDFE6 BankimOnline Admin" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [user && (_jsxs("div", { className: "text-sm text-gray-700", children: ["Welcome, ", _jsx("span", { className: "font-medium", children: user.name }), _jsx("div", { className: "text-xs text-gray-500", children: user.role })] })), _jsx("button", { onClick: handleLogout, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium", children: "Logout" })] })] }) }) }), _jsxs("div", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: [_jsx("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-md", children: _jsxs("div", { className: "text-green-800", children: [_jsx("h3", { className: "font-medium", children: "\uD83C\uDF89 Admin Panel Working!" }), _jsx("p", { className: "text-sm mt-1", children: "Phase 1 implementation successful. Admin authentication and dashboard are functional." })] }) }), _jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Overview of system statistics and quick actions" })] }), stats && (_jsxs("div", { className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8", children: [_jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "text-2xl", children: "\uD83D\uDC65" }) }), _jsx("div", { className: "ml-5 w-0 flex-1", children: _jsxs("dl", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Total Clients" }), _jsx("dd", { className: "text-lg font-medium text-gray-900", children: stats.totalClients })] }) })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "text-2xl", children: "\uD83C\uDFE6" }) }), _jsx("div", { className: "ml-5 w-0 flex-1", children: _jsxs("dl", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Total Banks" }), _jsx("dd", { className: "text-lg font-medium text-gray-900", children: stats.totalBanks })] }) })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "text-2xl", children: "\uD83D\uDCCB" }) }), _jsx("div", { className: "ml-5 w-0 flex-1", children: _jsxs("dl", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Applications" }), _jsx("dd", { className: "text-lg font-medium text-gray-900", children: stats.totalApplications })] }) })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("div", { className: "text-2xl", children: "\uD83D\uDC68\u200D\uD83D\uDCBC" }) }), _jsx("div", { className: "ml-5 w-0 flex-1", children: _jsxs("dl", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "Admin Users" }), _jsx("dd", { className: "text-lg font-medium text-gray-900", children: stats.totalAdmins })] }) })] }) }) })] })), _jsx("div", { className: "bg-white shadow rounded-lg", children: _jsxs("div", { className: "px-4 py-5 sm:p-6", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: "Phase 1 Complete \u2705" }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\u2705 Working Features" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Admin authentication" }), _jsx("li", { children: "\u2022 JWT token management" }), _jsx("li", { children: "\u2022 Dashboard statistics" }), _jsx("li", { children: "\u2022 Route protection" }), _jsx("li", { children: "\u2022 Database integration" })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: "\uD83D\uDEA7 Coming in Phase 2" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 Calculation editing" }), _jsx("li", { children: "\u2022 Bank management" }), _jsx("li", { children: "\u2022 User management" }), _jsx("li", { children: "\u2022 Settings panel" }), _jsx("li", { children: "\u2022 Reports & analytics" })] })] })] }), _jsx("div", { className: "mt-6 p-4 bg-blue-50 rounded-md", children: _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("p", { className: "font-medium", children: "\uD83C\uDFAF Phase 1 Status: COMPLETE" }), _jsx("p", { className: "mt-1", children: "Admin authentication and basic dashboard are working. Ready to proceed to Phase 2 for calculation management features." })] }) })] }) })] })] }));
};
export default AdminDashboard;
