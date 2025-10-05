// src/routes/PrivateRoute.tsx
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function PrivateRoute() {
  const { user } = useAuth()
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
