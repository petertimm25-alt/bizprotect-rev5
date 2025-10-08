// src/layouts/AppShell.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[#0B1B2B] text-white">
      {/* Header ติดบน */}
      <HeaderNav />

      {/* Content */}
      <main className="pt-16">
        {/* คอนเทนต์ภายในหน้าต่าง ๆ */}
        <Outlet />
      </main>

      {/* Footer เล็ก ๆ */}
      <footer className="mt-14 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-white/60">
          © {new Date().getFullYear()} BizProtect • All rights reserved.
        </div>
      </footer>
    </div>
  )
}
