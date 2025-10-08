// src/components/FeatureGuard.tsx
import React from 'react'
import { useAuth } from '../lib/auth'
import { hasFeature, type FeatureKey } from '../lib/roles'
import { Link } from 'react-router-dom'

type Props = {
  need?: FeatureKey | FeatureKey[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ใช้ล้อมส่วนที่ต้องมีสิทธิ์ เช่น:
 * <FeatureGuard need="custom_branding"> ... </FeatureGuard>
 * หรือหลายสิทธิ์: need={['export_pdf','no_watermark']}
 */
export default function FeatureGuard({ need, children, fallback }: Props) {
  const { plan } = useAuth()

  const ok = React.useMemo(() => {
    if (!need) return true
    const arr = Array.isArray(need) ? need : [need]
    return arr.every((k) => hasFeature(plan, k))
  }, [plan, need])

  if (ok) return <>{children}</>
  return (
    <>
      {fallback ?? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80">
          ส่วนนี้สงวนสำหรับผู้ใช้แพ็กเกจที่สูงกว่า —{' '}
          <Link to="/pricing" className="text-[#EBDCA6] underline decoration-[#EBDCA6]/60">
            อัปเกรดแพ็กเกจ
          </Link>
        </div>
      )}
    </>
  )
}
