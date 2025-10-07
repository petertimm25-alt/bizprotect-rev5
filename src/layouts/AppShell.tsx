import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-[color:var(--page)] text-[color:var(--ink)]">
      <HeaderNav />
      <Outlet />
    </div>
  )
}
