// src/routes/PrivateRoute.tsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function PrivateRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]">
        กำลังตรวจสอบสิทธิ์…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname || '/' }} />
  }

  return <Outlet />
}
