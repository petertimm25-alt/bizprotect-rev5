import React, { useEffect } from "react";
import Hero from "../components/Hero";
import BenefitDeck from "../components/BenefitDeck";
import Pricing from "./Pricing";

export default function Landing() {
  // SEO เบื้องต้น
  useEffect(() => {
    document.title =
      "Keyman Corporate Policy Calculator • BizProtect | คำนวณ PIT/Gross-Up + Export PDF";
    const desc =
      "เว็บแอปช่วยพรีเซนต์สวัสดิการประกันชีวิตสำหรับผู้บริหาร/กรรมการ: จำลอง PIT/Gross-Up, เปรียบเทียบก่อน–หลังซื้อ, Export PDF พื้นขาวแบบพรีเมียม พร้อม CI Navy/Gold";
    let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", desc);
  }, []);

  return (
    <div className="text-white">
      {/* HERO — โทน Navy/Gold */}
      <Hero />

      {/* การ์ดจุดเด่น */}
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <BenefitDeck />
      </div>

      {/* เหมาะกับใคร */}
      <section className="mt-16 md:mt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gold">เหมาะกับใคร</h2>
          <div className="grid gap-4 md:grid-cols-3 mt-4">
            {[
              { h: "ผู้บริหาร/เจ้าของกิจการ", p: "อยากเห็นผลกระทบภาษีและเงินสุทธิก่อนตัดสินใจซื้อ" },
              { h: "ตัวแทน/ที่ปรึกษา", p: "ต้องมีตัวเลขชัด ๆ ในห้องประชุมเพื่อปิดดีลไว" },
              { h: "ฝ่ายบัญชี/การเงิน", p: "ต้องการเอกสารประกอบการตัดสินใจในรูปแบบสวยอ่านง่าย" },
            ].map((x) => (
              <article
                key={x.h}
                className="rounded-2xl border border-white/10 p-6"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                }}
              >
                <h3 className="text-lg font-semibold text-gold">{x.h}</h3>
                <p className="text-white/85 mt-2">{x.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mt-16 md:mt-24">
        <Pricing />
      </section>

      {/* CTA ปิดท้าย */}
      <section className="mt-16 md:mt-24 mb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div
            className="rounded-2xl border border-white/10 p-6 md:p-8 text-center"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.25)",
            }}
          >
            <h3 className="text-xl md:text-2xl font-semibold text-[#EBDCA6]">
              เริ่มพรีเซนต์อย่างมืออาชีพในไม่กี่นาที
            </h3>
            <p className="text-white/80 mt-2">
              ลองสร้างตัวอย่าง เคสจริงของลูกค้า แล้ว Export PDF
              บนดีไซน์พรีเมียมได้ทันที
            </p>
            <div className="mt-5">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold bg-[var(--gold)] text-[#0B1B2B] hover:brightness-95"
              >
                เริ่มใช้งานเดี๋ยวนี้
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
