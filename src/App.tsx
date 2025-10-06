import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'

import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard' // หรือ UnifiedDashboard ถ้าชื่อไฟล์คุณเป็นแบบนั้น
import PrivateRoute from './routes/PrivateRoute'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* หน้าที่ต้องมี Header */}
        <Route element={<AppShell />}>
          {/* ต้องล็อกอิน */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* หน้าสาธารณะ */}
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* หน้าที่ไม่ต้องมี Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* default */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
