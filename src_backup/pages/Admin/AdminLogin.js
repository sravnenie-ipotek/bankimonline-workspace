import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Admin Login Page
 * Handles authentication for admin users
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Simple component to test if the issue is with imports
const AdminLogin = () => {
    const [email, setEmail] = useState('test@test');
    const [password, setPassword] = useState('test');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    // Simple login function for testing
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8003/api';
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                // Store token and redirect
                localStorage.setItem('adminToken', data.data.token);
                navigate('/admin/dashboard');
            }
            else {
                setError(data.message || 'Login failed');
            }
        }
        catch (err) {
            setError('Network error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:mx-auto sm:w-full sm:max-w-md", children: [_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "text-3xl font-bold text-indigo-600", children: "\uD83C\uDFE6 BankimOnline" }) }), _jsx("h2", { className: "mt-6 text-center text-3xl font-extrabold text-gray-900", children: "Admin Panel" }), _jsx("p", { className: "mt-2 text-center text-sm text-gray-600", children: "Sign in to access administrative features" }), _jsx("div", { className: "mt-4 p-4 bg-blue-50 rounded-md", children: _jsxs("div", { className: "text-sm text-blue-700", children: [_jsx("p", { children: _jsx("strong", { children: "Debug Info:" }) }), _jsx("p", { children: "\u2705 Component loaded successfully" }), _jsx("p", { children: "\uD83D\uDD27 Simplified version for testing" })] }) })] }), _jsx("div", { className: "mt-8 sm:mx-auto sm:w-full sm:max-w-md", children: _jsxs("div", { className: "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10", children: [_jsxs("form", { className: "space-y-6", onSubmit: handleLogin, children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email address" }), _jsx("div", { className: "mt-1", children: _jsx("input", { id: "email", name: "email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("div", { className: "mt-1", children: _jsx("input", { id: "password", name: "password", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" }) })] }), error && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsx("div", { className: "text-sm text-red-700", children: error }) })), _jsx("div", { children: _jsx("button", { type: "submit", disabled: loading, className: "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50", children: loading ? 'Signing in...' : 'Sign in' }) })] }), _jsx("div", { className: "mt-6 p-4 bg-green-50 rounded-md", children: _jsxs("div", { className: "text-sm text-green-700", children: [_jsx("p", { className: "font-medium", children: "Test Credentials:" }), _jsx("p", { children: "Email: test@test" }), _jsx("p", { children: "Password: test" }), _jsx("p", { className: "mt-2 text-xs", children: "These are pre-filled for testing" })] }) })] }) })] }));
};
export default AdminLogin;
