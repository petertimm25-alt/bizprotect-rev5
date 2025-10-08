import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function BenefitDeck() {
    const items = [
        {
            title: "พูดด้วยข้อมูล ไม่เดา",
            bullets: [
                "เห็นผลทันที—ก่อน/หลังทำประกัน",
                "โชว์ภาษีออกแทนทุกทอดแบบโปร",
                "เงินสุทธิกรรมการ “คงเดิม”",
            ],
        },
        {
            title: "Export เอกสารทันที",
            bullets: [
                "สรุปบริษัท/กรรมการเป็น PDF",
                "แนบภาคผนวกข้อหารือ",
                "หน้าตาพรีเมียม น่าเชื่อถือ",
            ],
        },
        {
            title: "นำเสนอซ้ำได้ไว",
            bullets: [
                "เซ็ตจำนวนกรรมการได้หลายคน",
                "อัปเดตตัวเลขสดหน้างาน",
                "ประหยัดเวลาเตรียมสไลด์",
            ],
        },
    ];
    return (_jsx("section", { className: "mt-8", children: _jsx("div", { className: "grid gap-4 md:grid-cols-3 xl:grid-cols-3", children: items.map((card) => (_jsxs("article", { className: "rounded-2xl border border-white/10 p-6 md:p-7", style: {
                    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.25)",
                }, children: [_jsx("h3", { className: "text-xl font-semibold text-[color:var(--gold-2)]", children: card.title }), _jsx("ul", { className: "mt-3 space-y-2 text-white/90 leading-relaxed", children: card.bullets.map((b, i) => (_jsxs("li", { className: "flex gap-3", children: [_jsx("span", { className: "mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/70" }), _jsx("span", { children: b })] }, i))) })] }, card.title))) }) }));
}
