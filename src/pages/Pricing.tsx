// src/pages/Pricing.tsx
import React from 'react'
import { Link } from 'react-router-dom'

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2">
    <span className="mt-1">•</span>
    <span>{children}</span>
  </li>
)

type PlanKey = 'free' | 'pro' | 'ultra'

export default function Pricing() {
  const [selected, setSelected] = React.useState<PlanKey>('pro')

  const baseCard = "rounded-2xl p-6 bg-white/5 transition-all outline-none cursor-pointer"
  const focusGold = "focus-visible:ring-2 focus-visible:ring-gold focus-visible:shadow-[0_0_0_3px_rgba(212,175,55,.28)]"
  const normalRing = "ring-1 ring-white/10 hover:ring-gold/40"
  const activeRing = "ring-2 ring-gold shadow-[0_8px_24px_rgba(212,175,55,.18)]"

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-gold mb-6">เลือกแผน</h1>

      <div role="radiogroup" aria-label="เลือกแผนการใช้งาน" className="grid md:grid-cols-3 gap-6">
        {/* Free */}
        <div
          role="radio"
          aria-checked={selected === 'free'}
          tabIndex={0}
          onClick={() => setSelected('free')}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setSelected('free')}
          className={[baseCard, focusGold, selected === 'free' ? activeRing : normalRing].join(' ')}
        >
          <div className="text-lg font-semibold">Free</div>
          <div className="text-3xl font-bold mt-1">
            ฿0<span className="text-base font-normal"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>
          <div className="mt-1 text-xs text-[color:var(--ink-dim)]">โควตา Export: 3 ครั้ง/เดือน (มีวอเตอร์มาร์ก)</div>
          <ul className="mt-4 space-y-2 text-sm">
            <Bullet>ผู้บริหารสูงสุด 1 คน</Bullet>
            <Bullet>คำนวณ CIT/PIT และภาษีออกแทนทุกทอด</Bullet>
            <Bullet>คำนวณเปรียบเทียบก่อน/หลัง ทำกรมธรรม์ฯ</Bullet>
            <Bullet>คำนวณเงินบวกกลับค่าใช้จ่ายต้องห้าม</Bullet>
          </ul>
          <Link
            to="/login"
            className="mt-6 w-full inline-block text-center rounded-lg ring-1 ring-white/20 px-4 py-2 hover:bg-white/10"
          >
            เริ่มใช้งาน (ต้องเข้าสู่ระบบ)
          </Link>
        </div>

        {/* Pro */}
        <div
          role="radio"
          aria-checked={selected === 'pro'}
          tabIndex={0}
          onClick={() => setSelected('pro')}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setSelected('pro')}
          className={[baseCard, focusGold, selected === 'pro' ? activeRing : normalRing, "relative"].join(' ')}
        >
          <div className="absolute -top-3 right-4 text-[10px] px-2 py-1 rounded bg-gold/20 text-gold ring-1 ring-gold/40">
            แนะนำ
          </div>
          <div className="text-lg font-semibold">Pro</div>
          <div className="text-3xl font-bold mt-1">
            ฿590<span className="text-base font-normal"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>
          <div className="mt-1 text-xs text-[color:var(--ink-dim)]">โควตา Export: 30 ครั้ง/เดือน (ไม่มีลายน้ำ)</div>
          <ul className="mt-4 space-y-2 text-sm">
            <Bullet>เพิ่มผู้บริหารสูงสุด 3 คน</Bullet>
            <Bullet>ทุกอย่างใน Free</Bullet>
            <Bullet>Export PDF เพื่อเสนอลูกค้า</Bullet>
            <Bullet>ใส่ข้อมูลตัวแทนบนเอกสาร (ชื่อ/เบอร์/อีเมล)</Bullet>
          </ul>
          <Link
            to="/login"
            className="mt-6 w-full inline-block text-center rounded-lg ring-1 ring-gold/50 px-4 py-2 hover:bg-gold/10 text-gold"
          >
            อัปเกรดเป็น PRO (หลังเข้าสู่ระบบ)
          </Link>
        </div>

        {/* Ultra */}
        <div
          role="radio"
          aria-checked={selected === 'ultra'}
          tabIndex={0}
          onClick={() => setSelected('ultra')}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setSelected('ultra')}
          className={[baseCard, focusGold, selected === 'ultra' ? activeRing : normalRing].join(' ')}
        >
          <div className="text-lg font-semibold">Ultra</div>
          <div className="text-3xl font-bold mt-1">
            ฿990<span className="text-base font-normal"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>
          <div className="mt-1 text-xs text-[color:var(--ink-dim)]">Export ไม่จำกัด (ไม่มีลายน้ำ)</div>
          <ul className="mt-4 space-y-2 text-sm">
            <Bullet>เพิ่มผู้บริหารสูงสุด 10 คน</Bullet>
            <Bullet>ทุกอย่างใน Pro</Bullet>
            <Bullet>คลัง “ข้อหารือกรมสรรพากร”</Bullet>
            <Bullet>เพิ่มโลโก้หรือแบรนด์ของตัวเอง</Bullet>
          </ul>
          <Link
            to="/login"
            className="mt-6 w-full inline-block text-center rounded-lg ring-1 ring-gold/50 px-4 py-2 hover:bg-gold/10 text-gold"
          >
            อัปเกรดเป็น ULTRA (หลังเข้าสู่ระบบ)
          </Link>
        </div>
      </div>
    </main>
  )
}
