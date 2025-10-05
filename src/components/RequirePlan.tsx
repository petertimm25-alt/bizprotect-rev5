import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { hasFeature, type Feature } from '../lib/roles'

export default function RequireFeature({
  need,
  children,
  fallbackTo = '/pricing',
}: {
  need: Feature | Feature[]
  children: React.ReactNode
  fallbackTo?: string
}) {
  const { user } = useAuth()
  const needs = Array.isArray(need) ? need : [need]
  const ok = user && needs.every(f => hasFeature(user.plan, f))

  if (!ok) return <Navigate to={fallbackTo} replace />
  return <>{children}</>
}
