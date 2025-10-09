// src/layouts/AppShell.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav'
import { useAuth } from '../lib/auth'

function DebugBar() {
  const { user, plan, ent, loading } = useAuth()
  return (
    <div className="text-xs bg-black/70 text-green-300 px-4 py-1 font-mono">
      <div>loading: {String(loading)}</div>
      <div>user: {user ? `${user.email} (${user.id.slice(0,6)})` : 'null'}</div>
      <div>plan: {plan}</div>
      <div>ent.export_pdf: {String(ent?.export_pdf)}</div>
      <div>ent.directorsMax: {ent?.directorsMax}</div>
    </div>
  )
}

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav />
      <DebugBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
