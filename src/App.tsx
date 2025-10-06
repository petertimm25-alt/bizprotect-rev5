// src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'

import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'   // หรือ UnifiedDashboard ถ้าชื่อไฟล์คุณเป็นแบบนั้น
import Knowledge from './pages/Knowledge'   // ถ้าไม่มีไฟล์นี้ ให้สร้าง placeholder ง่าย ๆ ไว้ก่อน
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* กลุ่มหน้าที่มี Header */}
        <Route element={<AppShell />}>
          {/* ต้องล็อกอินก่อนเข้าหน้าในกลุ่มนี้ */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
          </Route>

          {/* สาธารณะ */}
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* หน้าที่ไม่ต้องมี Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* default → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
