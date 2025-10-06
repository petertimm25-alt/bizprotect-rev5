import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export default function AuthCallback() {
  const { handleCallbackFromUrl } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  React.useEffect(() => {
    (async () => {
      try {
        await handleCallbackFromUrl()
        const to = (loc.state as any)?.from?.pathname || '/dashboard'
        nav(to, { replace: true })
      } catch (e) {
        console.error(e)
        nav('/login', { replace: true })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm opacity-80">กำลังยืนยันลิงก์เข้าสู่ระบบ…</div>
    </div>
  )
}
