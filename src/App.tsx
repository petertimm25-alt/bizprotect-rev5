import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'

import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'   // หรือ UnifiedDashboard หากใช้ชื่อนั้น
import Knowledge from './pages/Knowledge'   // ถ้ายังไม่มี สร้าง placeholder ไว้ก่อน
import Landing from './pages/Landing'
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* กลุ่มหน้าที่ “มี Header” */}
        <Route element={<AppShell />}>
          {/* สาธารณะ */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* ต้องล็อกอินก่อน */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/knowledge" element={<Knowledge />} />
          </Route>
        </Route>

        {/* กลุ่มที่ “ไม่มี Header” */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* default → หน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
