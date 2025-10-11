import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import AppShell from './layouts/AppShell';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Pricing from './pages/Pricing';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Knowledge from './pages/Knowledge';
import PrivateRoute from './routes/PrivateRoute';
// FAB ปรับขนาดตัวอักษร (แสดงเฉพาะ Pro/Ultra)
import FontScalerFab from './components/FontScalerFab';
// ✅ สร้าง/เก็บ device_id ทันทีเมื่อแอปบูต (mirror เป็น cookie ด้วย)
import { getOrCreateDeviceId } from './lib/device-id';
export default function App() {
    React.useEffect(() => {
        try {
            getOrCreateDeviceId({ alsoCookie: true });
        }
        catch {
            // เงียบไว้กัน console รกในโปรดักชัน
        }
    }, []);
    return (_jsxs(AuthProvider, { children: [_jsx(FontScalerFab, {}), _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(Pricing, {}) }), _jsxs(Route, { element: _jsx(PrivateRoute, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/knowledge", element: _jsx(Knowledge, {}) })] })] }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }));
}
