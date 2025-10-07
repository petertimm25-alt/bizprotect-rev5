// src/App.tsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'

import AppShell from './layouts/AppShell'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Knowledge from './pages/Knowledge'
import PrivateRoute from './routes/PrivateRoute'
import PlanGuard from './routes/PlanGuard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* กลุ่มหน้าที่มี Header */}
        <Route element={<AppShell />}>
          {/* สาธารณะ */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* ต้องล็อกอินก่อนเข้าหน้าในกลุ่มนี้ */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ต้องเป็น ULTRA เท่านั้น — ไม่มี redirect เพื่อกันอาการกระพริบ */}
            <Route
              path="/knowledge"
              element={
                <PlanGuard requirePlan="ultra">
                  <Knowledge />
                </PlanGuard>
              }
            />
          </Route>
        </Route>

        {/* หน้าที่ไม่ต้องมี Header */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* default → หน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
