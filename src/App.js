import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import AppShell from './layouts/AppShell';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Pricing from './pages/Pricing';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard'; // ถ้าคุณใช้ UnifiedDashboard เปลี่ยน import ตรงนี้
import Knowledge from './pages/Knowledge';
import PrivateRoute from './routes/PrivateRoute';
export default function App() {
    return (_jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(Pricing, {}) }), _jsxs(Route, { element: _jsx(PrivateRoute, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/knowledge", element: _jsx(Knowledge, {}) })] })] }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
