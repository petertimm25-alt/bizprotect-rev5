// src/components/RequireAuth.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return <>{children}</>
}
