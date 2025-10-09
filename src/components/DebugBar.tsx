import React from 'react'
import { useAuth } from '../lib/auth'

function useDebugEnabled() {
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    const urlHas = new URLSearchParams(location.search).has('debug')
    const ls = localStorage.getItem('bp:debug') === '1'
    setOn(urlHas || ls)
  }, [])
  return on
}

export default function DebugBar() {
  const show = useDebugEnabled()
  const { user, plan, ent } = useAuth()
  if (!show) return null
  return (
    <div className="w-full bg-black/60 text-[11px] text-white/90 px-3 py-2 flex flex-wrap gap-3">
      <span>DEBUG</span>
      <span>email: <b>{user?.email || '-'}</b></span>
      <span>plan: <b>{plan}</b></span>
      <span>export_pdf: <b>{String(ent.export_pdf)}</b></span>
      <span>directorsMax: <b>{ent.directorsMax}</b></span>
    </div>
  )
}
