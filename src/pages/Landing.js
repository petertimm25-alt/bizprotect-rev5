import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Landing.tsx
import { useEffect } from "react";
import Hero from "../components/Hero";
import BenefitDeck from "../components/BenefitDeck";
import Pricing from "./Pricing";
export default function Landing() {
    // ตั้งค่า SEO เบื้องต้น
    useEffect(() => {
        document.title =
            "Keyman Corporate Policy Calculator • BizProtect | คำนวณ PIT/Gross-Up + Export PDF";
        const desc = "เว็บแอปช่วยพรีเซนต์สวัสดิการประกันชีวิตสำหรับผู้บริหาร/กรรมการ: จำลอง PIT/Gross-Up, เปรียบเทียบก่อน–หลังซื้อ, Export PDF พื้นขาวแบบพรีเมียม พร้อม CI Navy/Gold";
        let el = document.querySelector('meta[name="description"]');
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("name", "description");
            document.head.appendChild(el);
        }
        el.setAttribute("content", desc);
    }, []);
    return (_jsxs("div", { className: "text-white", children: [_jsx(Hero, {}), _jsx("div", { className: "max-w-6xl mx-auto px-6 md:px-10", children: _jsx(BenefitDeck, {}) }), _jsx("section", { className: "mt-16 md:mt-24", children: _jsxs("div", { className: "max-w-6xl mx-auto px-6 md:px-10", children: [_jsx("h2", { className: "text-2xl md:text-3xl font-semibold text-[var(--brand-accent)]", children: "\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E43\u0E04\u0E23" }), _jsx("div", { className: "grid gap-4 md:grid-cols-3 mt-4", children: [
                                {
                                    h: "ผู้บริหาร/เจ้าของกิจการ",
                                    p: "อยากเห็นผลกระทบภาษีและเงินสุทธิก่อนตัดสินใจซื้อ",
                                },
                                {
                                    h: "ตัวแทน/ที่ปรึกษา",
                                    p: "ต้องมีตัวเลขชัด ๆ ในห้องประชุมเพื่อปิดดีลไว",
                                },
                                {
                                    h: "ฝ่ายบัญชี/การเงิน",
                                    p: "ต้องการเอกสารประกอบการตัดสินใจในรูปแบบสวยอ่านง่าย",
                                },
                            ].map((x) => (_jsxs("article", { className: "rounded-2xl border border-white/10 p-6", style: {
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                                }, children: [_jsx("h3", { className: "text-lg font-semibold text-[var(--brand-accent)]", children: x.h }), _jsx("p", { className: "text-white/85 mt-2", children: x.p })] }, x.h))) })] }) }), _jsx("section", { id: "pricing", className: "mt-16 md:mt-24", children: _jsx(Pricing, {}) }), _jsx("section", { className: "mt-16 md:mt-24 mb-24", children: _jsx("div", { className: "max-w-6xl mx-auto px-6 md:px-10", children: _jsxs("div", { className: "rounded-2xl border border-white/10 p-6 md:p-8 text-center", style: {
                            background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.25)",
                        }, children: [_jsx("h3", { className: "text-xl md:text-2xl font-semibold text-[#EBDCA6]", children: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E1E\u0E23\u0E35\u0E40\u0E0B\u0E19\u0E15\u0E4C\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E21\u0E37\u0E2D\u0E2D\u0E32\u0E0A\u0E35\u0E1E\u0E43\u0E19\u0E44\u0E21\u0E48\u0E01\u0E35\u0E48\u0E19\u0E32\u0E17\u0E35" }), _jsx("p", { className: "text-white/80 mt-2", children: "\u0E25\u0E2D\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07 \u0E40\u0E04\u0E2A\u0E08\u0E23\u0E34\u0E07\u0E02\u0E2D\u0E07\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32 \u0E41\u0E25\u0E49\u0E27 Export PDF \u0E1A\u0E19\u0E14\u0E35\u0E44\u0E0B\u0E19\u0E4C\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21\u0E44\u0E14\u0E49\u0E17\u0E31\u0E19\u0E17\u0E35" }), _jsx("div", { className: "mt-5", children: _jsx("a", { href: "/dashboard", className: "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold bg-[var(--gold)] text-[#0B1B2B] hover:brightness-95", children: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E40\u0E14\u0E35\u0E4B\u0E22\u0E27\u0E19\u0E35\u0E49" }) })] }) }) })] }));
}
