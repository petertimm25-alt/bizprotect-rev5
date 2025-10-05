// src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeaderNav from './components/HeaderNav'
import Knowledge from './pages/Knowledge'
import Pricing from './pages/Pricing'
// import TaxEngine from './pages/TaxEngine'           // ⛔ ซ่อนแล้ว
// import ProposalBuilder from './pages/ProposalBuilder' // ⛔ ซ่อนแล้ว
// import RecommendedPlans from './pages/RecommendedPlans' // ⛔ ซ่อนแล้ว

// ใช้ UnifiedDashboard เป็น Dashboard (ถ้ารีเนมไฟล์เป็น Dashboard.tsx ให้เปลี่ยนบรรทัดนี้เป็น:
// import Dashboard from './pages/Dashboard'
import Dashboard from './pages/Dashboard'

import { AuthProvider } from './lib/auth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen text-[color:var(--ink)]">
          <HeaderNav />
          <Routes>
            {/* Dashboard เป็นหน้าแรก */}
            <Route path="/" element={<Dashboard />} />
            {/* เผื่อมีการลิงก์ตรงมาที่ /dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* หน้าอื่นที่ยังใช้ */}
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* ซ่อน route ที่รวมแล้ว */}
            {/* <Route path="/proposal" element={<ProposalBuilder />} /> */}
            {/* <Route path="/recommended-plans" element={<RecommendedPlans />} /> */}
            {/* <Route path="/engine" element={<TaxEngine />} /> */}
          </Routes>

          <footer className="mx-auto max-w-6xl px-6 py-8 text-sm text-[color:var(--ink-dim)]">
            © {new Date().getFullYear()} BizProtect
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
