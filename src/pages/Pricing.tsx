// src/pages/Pricing.tsx
import React from 'react'
import { Link } from 'react-router-dom'

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="mt-1 shrink-0">
    <path
      d="M7.6 13.6 4.3 10.3l-1.4 1.4 4.7 4.7 9.5-9.5-1.4-1.4-8.1 8.1Z"
      fill="currentColor"
    />
  </svg>
)

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 text-sm leading-6 text-white/90">
    <span className="text-gold"><Check /></span>
    <span>{children}</span>
  </li>
)

type PlanKey = 'free' | 'pro' | 'ultra'

export default function Pricing() {
  const [selected, setSelected] = React.useState<PlanKey>('pro')

  const baseCard =
    'relative rounded-2xl p-6 bg-white/[0.06] backdrop-blur-sm transition-all outline-none cursor-pointer'
  const focusGold =
    'focus-visible:ring-2 focus-visible:ring-gold focus-visible:shadow-[0_0_0_3px_rgba(212,175,55,.28)]'
  const normalRing =
    'ring-1 ring-white/10 hover:ring-gold/50 hover:shadow-[0_12px_24px_-8px_rgba(212,175,55,.18)]'
  const activeRing =
    'ring-2 ring-gold shadow-[0_18px_36px_-8px_rgba(212,175,55,.28)] translate-y-[-2px]'

  const RadioProps = (key: PlanKey) => ({
    role: 'radio' as const,
    tabIndex: 0,
    'aria-checked': selected === key,
    onClick: () => setSelected(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') setSelected(key)
    },
    className: [
      baseCard,
      focusGold,
      selected === key ? activeRing : normalRing,
      selected === key ? 'outline-none' : '',
    ].join(' '),
  })

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[12px] text-gold ring-1 ring-gold/30">
          แผนราคาสำหรับเอเจนซี่และที่ปรึกษา
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-[#EBDCA6]">
          จ่ายหลักร้อย เพื่อปิดเบี้ยหลักล้าน
        </h1>
        <p className="mt-2 text-white/70">
          เลือกแผนที่เหมาะกับทีมของคุณ — อัปเกรด/ดาวน์เกรดได้ตลอดเวลา
        </p>
      </header>

      {/* Toggle hint */}
      <div className="mb-5 text-center text-xs text-white/60">
        คลิกการ์ดเพื่อดูรายละเอียดและเน้นแผนที่ต้องการ
      </div>

      {/* Cards */}
      <div
        role="radiogroup"
        aria-label="เลือกแผนการใช้งาน"
        className="grid md:grid-cols-3 gap-6 items-stretch"
      >
        {/* Free */}
        <section {...RadioProps('free')}>
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-b from-white/8 to-transparent"></div>

          <div className="text-lg font-semibold">Free</div>
          <div className="mt-1 text-3xl font-bold text-[var(--brand-accent)]">
            ฿0
            <span className="text-base font-normal text-white/70"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>

          <ul className="mt-5 space-y-2">
            <Bullet>ผู้บริหารสูงสุด <b>1 คน</b></Bullet>
            <Bullet>คำนวณ CIT/PIT และภาษีออกแทนทุกทอด</Bullet>
            <Bullet>คำนวณเปรียบเทียบก่อน/หลัง ทำกรมธรรม์ฯ</Bullet>
            <Bullet>คำนวณเงินบวกกลับค่าใช้จ่ายต้องห้าม</Bullet>
            <Bullet>แนบแบบประกันฯ ที่แนะนำ</Bullet>
          </ul>

          <Link
            to="/login"
            className="mt-6 w-full inline-flex justify-center items-center rounded-lg px-4 py-2 ring-1 ring-white/20 hover:bg-white/10 text-sm"
          >
            เริ่มใช้งาน (ต้องเข้าสู่ระบบ)
          </Link>
        </section>

        {/* Pro */}
        <section {...RadioProps('pro')}>
          {/* Ribbon */}
          <div className="absolute -top-3 right-4">
            <div className="rounded-xl px-4 py-2 bg-[var(--brand-accent)] text-[#0B1B2B] font-semibold text-[16px] shadow">
              แนะนำ
            </div>
          </div>

          <div className="text-lg font-semibold">Pro</div>
          <div className="mt-1 text-3xl font-bold text-[var(--brand-accent)]">
            ฿590
            <span className="text-base font-normal text-white/70"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>

          <ul className="mt-5 space-y-2">
            <Bullet>เพิ่มผู้บริหารสูงสุด <b>5 คน</b></Bullet>
            <Bullet>ทุกอย่างใน Free</Bullet>
            <Bullet>Export PDF เพื่อเสนอลูกค้า</Bullet>
            <Bullet>แนบข้อหารือกรมสรรพากรในเอกสาร</Bullet>
            <Bullet>ใส่ข้อมูลตัวแทนบนเอกสาร (ชื่อ/เบอร์/อีเมล)</Bullet>
            <Bullet>ปรับขนาดตัวอักษรได้</Bullet>
          </ul>

          <Link
            to="/login"
            className="mt-6 w-full inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm
                       ring-1 ring-gold/50 hover:bg-gold/10 text-gold"
          >
            อัปเกรดเป็น PRO (หลังเข้าสู่ระบบ)
          </Link>

          {/* Sub-note: เน้นว่า Pro ไม่มีคลังความรู้ */}
          <p className="mt-3 text-[11px] text-white/60">
            * Pro <span className="text-red-300">ไม่รวม</span> คลัง “ข้อหารือกรมสรรพากร”
          </p>
        </section>

        {/* Ultra */}
        <section {...RadioProps('ultra')}>
          <div className="text-lg font-semibold">Ultra</div>
          <div className="mt-1 text-3xl font-bold text-[var(--brand-accent)]">
            ฿990
            <span className="text-base font-normal text-white/70"> /1 ที่นั่ง/ 1 อุปกรณ์ /เดือน</span>
          </div>

          <ul className="mt-5 space-y-2">
            <Bullet>เพิ่มผู้บริหารสูงสุด <b>10 คน</b></Bullet>
            <Bullet>ทุกอย่างใน Pro</Bullet>
            <Bullet>คลัง “ข้อหารือกรมสรรพากร”</Bullet>
            <Bullet>เพิ่มโลโก้หรือแบรนด์ของตัวเอง</Bullet>
          </ul>

          <Link
            to="/login"
            className="mt-6 w-full inline-flex justify-center items-center rounded-lg px-4 py-2 text-sm
                       ring-1 ring-gold/50 hover:bg-gold/10 text-gold"
          >
            อัปเกรดเป็น ULTRA (หลังเข้าสู่ระบบ)
          </Link>
        </section>
      </div>

      {/* Compare strip */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4 text-sm">
          <div className="font-semibold text-[#EBDCA6] mb-1">Free</div>
          <div className="text-white/75">เริ่มต้นทดลองเครื่องมือทั้งหมด ยกเว้นการส่งออกและคลังความรู้</div>
        </div>
        <div className="rounded-xl bg-white/[0.06] ring-2 ring-gold p-4 text-sm shadow-[0_10px_24px_-8px_rgba(212,175,55,.25)]">
          <div className="font-semibold text-[#EBDCA6] mb-1">Pro (แนะนำ)</div>
          <div className="text-white/75">
            โฟกัสงานขาย — <b className="text-gold">Export PDF ไม่จำกัด</b> + ใส่ข้อมูลผู้เสนอบนเอกสาร
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/10 p-4 text-sm">
          <div className="font-semibold text-[#EBDCA6] mb-1">Ultra</div>
          <div className="text-white/75">
            ครบสุดสำหรับทีมมืออาชีพ — คลังความรู้ + โลโก้/แบรนด์ของคุณ
          </div>
        </div>
      </div>
    </main>
  )
}
