import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { isUltra } from '../lib/roles'
import { toast } from '../lib/toast'
import { RULINGS } from '../data/rulings'

export default function Knowledge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const allow = !!user && isUltra(user.plan)

  React.useEffect(() => {
    if (!allow) {
      toast('หน้า “ข้อหารือกรมสรรพากร” ใช้ได้เฉพาะแผน Ultra')
      navigate('/pricing', { replace: true })
    }
  }, [allow, navigate])

  if (!allow) return null

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gold mb-4">ข้อหารือกรมสรรพากร</h1>
      <p className="text-sm text-[color:var(--ink-dim)] mb-6">
        คลังข้อหารือที่เกี่ยวข้องกับการบันทึกค่าเบี้ย/ภาษีออกแทน การปฏิบัติด้านเอกสาร และแนวทางวินิจฉัยต่าง ๆ
      </p>

      <div className="space-y-4">
        {RULINGS.map((r) => (
          <div key={r.docNo} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
            <div className="text-x font-semibold text-gold">
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{r.docNo}</a>
            </div>
            <div className="text-x mt-1">เรื่อง: {r.topic}</div>
            <div className="text-sm text-[color:var(--ink-dim)] mt-1">แนววินิจฉัย: {r.summary}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
