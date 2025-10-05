// src/App.tsx (ตัวอย่างโครง ถ้าไฟล์คุณมีหน้ามากกว่านี้ ให้ปรับตามจริง)
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import HeaderNav from './components/HeaderNav'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import PrivateRoute from './routes/PrivateRoute'
import { Navigate } from 'react-router-dom';

// ใส่หน้า Dashboard/Knowledge จริงของโปรเจกต์คุณแทนด้านล่าง
import Dashboard from './pages/Dashboard'
import Knowledge from './pages/Knowledge'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <HeaderNav />
        <Routes>
          {/* ต้องล็อกอินก่อน */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* หน้าเปิดสาธารณะ */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/login" element={<Login />} />
          <Route path="/demo" element={<Navigate to="/login" replace />} />
          <Route path="/try" element={<Navigate to="/login" replace />} />

          {/* fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
