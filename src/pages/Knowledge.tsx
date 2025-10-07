// src/pages/Knowledge.tsx
import React from 'react'
import { RULINGS, type Ruling } from '../data/rulings'

export default function Knowledge() {
  const [q, setQ] = React.useState('')

  const filtered = React.useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return RULINGS
    return RULINGS.filter((r) => {
      const hay = [r.docNo, r.cabinet, r.topic, r.summary]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(t)
    })
  }, [q])

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-xl md:text-2xl font-semibold text-[#EBDCA6]">
        คลัง “ข้อหารือกรมสรรพากร”
      </h1>
      <p className="mt-1 text-white/80">
        คัดประเด็นที่เกี่ยวข้องกับ Keyman / เบี้ยกรรมการ / ค่าใช้จ่ายต้องห้าม ฯลฯ
        ค้นหาด้วย “เลขที่หนังสือ, เลขตู้, หัวข้อ, สรุปสั้น”
      </p>

      {/* Search */}
      <div className="mt-4 flex items-center gap-2">
        <input
          className="w-full h-11 rounded-xl px-3 bp-input"
          placeholder="พิมพ์เพื่อค้นหา… เช่น 0706/ หรือ &quot;เบี้ยกรรมการ&quot;"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button className="bp-btn" onClick={() => setQ('')}>
            ล้าง
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {filtered.map((r: Ruling, idx) => {
          const key = r.docNo || `row-${idx}`
          return (
            <article
              key={key}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              {/* header line */}
              <div className="flex flex-wrap items-center gap-2">
                {/* เลขที่หนังสือ (ลิงก์) */}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bp-btn"
                  title="เปิดลิงก์ต้นทาง"
                >
                  {r.docNo}
                </a>
                {/* เลขตู้ */}
                <span className="text-xs px-2 py-0.5 rounded-full ring-1 ring-white/15 bg-white/10">
                  ตู้ {r.cabinet}
                </span>
              </div>

              {/* title */}
              <h3 className="mt-2 text-[17px] font-semibold text-[#EBDCA6]">
                {r.topic}
              </h3>

              {/* summary */}
              <p className="mt-2 text-sm text-white/90">{r.summary}</p>

              {/* actions */}
              <div className="mt-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bp-btn bp-btn-primary"
                >
                  อ่านฉบับเต็ม
                </a>
              </div>
            </article>
          )
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/80">
            ไม่พบรายการที่ตรงกับคำค้นหา
          </div>
        )}
      </div>
    </main>
  )
}
