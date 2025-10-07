// src/components/Hero.tsx
import React from "react";

export default function Hero() {
  return (
    <section className="hero-wrap">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        {/* การ์ดด้านใน */}
        <div
          className="rounded-2xl border border-white/10 bg-white/[.05] px-6 py-12 md:px-10 md:py-16 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          }}
        >
          {/* โลโก้ด้านบนสุด */}
          <div className="flex justify-center">
            <img
              src={'brand/BizProtectLogo.png'}
              alt="BizProtect"
              className="
                w-24 h-24 md:w-28 md:h-28
                rounded-full
                ring-1 ring-white/20
                shadow-[0_10px_25px_rgba(0,0,0,.35)]
                object-cover
                bg-[#0B1B2B] p-1
              "
            />
          </div>

          {/* แถบป้ายข้อความหลัก */}
          <span className="mt-4 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-[var(--brand-accent)] bg-white/10 border border-white/10">
            เครื่องมือสำหรับตัวแทนประกันธุรกิจ
          </span>

          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-[#EBDCA6]">
            Keyman Corporate Policy Calculator
          </h1>

          <p className="mt-3 text-gold max-w-3xl mx-auto leading-relaxed">
            ปิดดีล Keyman กับเจ้าของกิจการได้ไวขึ้น — พรีเซนต์ให้ผู้บริหารเห็นตัวเลขจริง
            <span className="mx-2 inline-block rounded-lg px-2 py-0.5 text-sm bg-white/10 border border-white/10">
              เงินสุทธิกรรมการไม่ลดลง
            </span>
            <span className="mx-1 inline-block rounded-lg px-2 py-0.5 text-sm bg-white/10 border border-white/10">
              ภาษีบริษัทลดลง
            </span>
            และ
            <span className="mx-1 inline-block rounded-lg px-2 py-0.5 text-sm bg-white/10 border border-white/10">
              Export PDF สรุปสั้น กระชับ
            </span>
            ใช้ตัดสินใจในห้องประชุมได้ทันที
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/dashboard"
              className="rounded-xl px-4 py-2 bg-[var(--brand-accent)] text-[#0B1B2B] font-semibold hover:brightness-95"
            >
              ลองใช้งานทันที
            </a>
          </div>

          {/* จุดเด่น 3 ข้อ */}
          <div className="grid gap-4 md:grid-cols-2 mt-8 text-left text-gold">
            {[
              ["เห็นผลลัพธ์เร็ว", "สรุปใน 5 นาที · ลดข้อโต้แย้งเรื่องภาษีจากข้อหารือกรมสรรพากร"],
              ["พร้อมนำเสนอจริง", "Export เอกสารทันที · PDF สีครีมเรียบหรู · ลายเซ็นท้ายเอกสาร"],
            ].map(([t, s]) => (
              <div
                key={t}
                className="rounded-2xl border border-white/15 bg-white/[.04] p-5"
              >
                <div className="text-[var(--brand-accent)] font-semibold">{t}</div>
                <div className="mt-1 text-white/80">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
