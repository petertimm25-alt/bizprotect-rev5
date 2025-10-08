import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/dashboard/DirectorsSection.tsx
import React from 'react';
import Card from '../../components/Card';
import NumberInput from '../../components/NumberInput';
import { pitTax, progressiveGrossUp } from '../../lib/tax';
import { emptyIfZero, fmt2 } from '../../components/Num';
// ===== Safe getters =====
const getSex = (d) => (d.sex === 'female' ? 'female' : 'male');
const getAge = (d) => (typeof d.age === 'number' && !Number.isNaN(d.age) ? d.age : 35);
const getSumAssured = (d) => typeof d.sumAssured === 'number' && !Number.isNaN(d.sumAssured) ? d.sumAssured : 10000000;
const getPremium = (d) => typeof d.personalInsurancePremium === 'number' && !Number.isNaN(d.personalInsurancePremium)
    ? d.personalInsurancePremium
    : 200000;
const getSurr = (d, key) => {
    const v = d[key];
    return typeof v === 'number' && !Number.isNaN(v) ? v : undefined;
};
// ===== Component =====
export default function DirectorsSection({ directors, limit, setData, personalExpense, personalAllowance, recProductName, recPayYears, recCoverage, setRecFields }) {
    // อายุแบบ draft ต่อคน (ใน section นี้เท่านั้น)
    const [ageDraft, setAgeDraft] = React.useState({});
    // ซิงก์ ageDraft เมื่อรายการกรรมการเปลี่ยน
    React.useEffect(() => {
        setAgeDraft(prev => {
            const next = { ...prev };
            directors.forEach(d => {
                if (next[d.id] === undefined) {
                    next[d.id] = d.age != null ? String(d.age) : '';
                }
            });
            // ล้าง entry ที่ไม่มีแล้ว
            Object.keys(next).forEach(id => {
                if (!directors.find(d => d.id === id))
                    delete next[id];
            });
            return next;
        });
    }, [directors]);
    const canAdd = directors.length < limit;
    const addDirector = () => {
        if (!canAdd)
            return;
        setData((s) => ({
            ...s,
            company: {
                ...s.company,
                directors: [
                    ...s.company.directors,
                    {
                        id: String(Date.now()),
                        name: `ผู้บริหาร ${s.company.directors.length + 1}`,
                        annualSalary: undefined,
                        personalInsurancePremium: undefined,
                    },
                ],
            },
        }));
    };
    const removeLast = () => setData((s) => ({
        ...s,
        company: { ...s.company, directors: s.company.directors.slice(0, -1) },
    }));
    return (_jsxs("section", { id: "directors-sec", className: "space-y-4", children: [_jsxs(Card, { title: "\u0E41\u0E1A\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2F \u0E41\u0E19\u0E30\u0E19\u0E33 (\u0E43\u0E0A\u0E49\u0E01\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E17\u0E38\u0E01\u0E04\u0E19)", children: [_jsxs("div", { className: "grid md:grid-cols-3 gap-3", children: [_jsx("input", { className: "w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60", value: recProductName, onChange: (e) => setRecFields({ recProductName: e.target.value }), placeholder: "\u0E0A\u0E37\u0E48\u0E2D\u0E41\u0E1A\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19 \u0E40\u0E0A\u0E48\u0E19 My Style Legacy Ultra" }), _jsx("input", { className: "w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60", value: recPayYears, onChange: (e) => setRecFields({ recPayYears: e.target.value }), placeholder: "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E49\u0E22(\u0E1B\u0E35) \u0E40\u0E0A\u0E48\u0E19 7 \u0E1B\u0E35" }), _jsx("input", { className: "w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60", value: recCoverage, onChange: (e) => setRecFields({ recCoverage: e.target.value }), placeholder: "\u0E23\u0E30\u0E22\u0E30\u0E40\u0E27\u0E25\u0E32\u0E04\u0E38\u0E49\u0E21\u0E04\u0E23\u0E2D\u0E07 \u0E40\u0E0A\u0E48\u0E19 \u0E16\u0E36\u0E07\u0E2D\u0E32\u0E22\u0E38 99 \u0E1B\u0E35" })] }), _jsx("div", { className: "text-xs text-[color:var(--ink-dim)] mt-2", children: "* \u0E17\u0E31\u0E49\u0E07 3 \u0E1F\u0E34\u0E25\u0E14\u0E4C\u0E40\u0E01\u0E47\u0E1A\u0E40\u0E1B\u0E47\u0E19 string \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E2B\u0E25\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19" })] }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: removeLast, className: "bp-btn bp-btn--sm bp-btn--ghost disabled:opacity-40 hover:text-gold", disabled: directors.length === 0, title: directors.length === 0 ? 'ไม่มีรายการให้ลบ' : 'ลบผู้บริหารคนสุดท้าย', children: "- \u0E25\u0E1A" }), _jsxs("button", { onClick: addDirector, className: "bp-btn bp-btn--sm bp-btn--ghost disabled:opacity-40 hover:text-gold-2", disabled: !canAdd, title: canAdd ? 'เพิ่มผู้บริหาร' : `ครบสูงสุด ${limit} คนแล้ว`, children: ["+ \u0E40\u0E1E\u0E34\u0E48\u0E21 (\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 ", limit, ")"] })] }), directors.length === 0 && (_jsx(Card, { title: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23", children: _jsx("div", { className: "text-sm text-[color:var(--ink-dim)]", children: "\u0E42\u0E1B\u0E23\u0E14\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23\u0E43\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E19\u0E35\u0E49 \u0E41\u0E25\u0E49\u0E27\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E23\u0E32\u0E22\u0E04\u0E19" }) })), directors.map((d, idx) => {
                const sex = getSex(d);
                const age = getAge(d);
                const sumAssured = getSumAssured(d);
                const yearlyPremium = getPremium(d);
                const surrY7 = getSurr(d, 'surrenderY7');
                const surrAge60 = getSurr(d, 'surrenderAge60');
                const surrAge70 = getSurr(d, 'surrenderAge70');
                const surrAge99 = getSurr(d, 'surrenderAge99');
                // PIT trio preview (กัน NaN ทุกทางเข้า)
                const base = typeof d.annualSalary === 'number' && !Number.isNaN(d.annualSalary) ? d.annualSalary : 0;
                const prem = typeof d.personalInsurancePremium === 'number' && !Number.isNaN(d.personalInsurancePremium)
                    ? d.personalInsurancePremium
                    : 0;
                const safeExpense = Number.isFinite(personalExpense) ? personalExpense : 0;
                const safeAllowance = Number.isFinite(personalAllowance) ? personalAllowance : 0;
                const g3 = progressiveGrossUp(base, prem, safeExpense + safeAllowance);
                const tax1 = Math.max(0, base - safeExpense - safeAllowance);
                const pit1 = pitTax(tax1);
                const tax2 = Math.max(0, base + prem - safeExpense - safeAllowance);
                const pit2 = pitTax(tax2);
                const tax3 = Math.max(0, base + prem + g3 - safeExpense - safeAllowance);
                const pit3 = pitTax(tax3);
                const netY1 = base - pit1;
                const netY2 = base - pit2;
                const netY3 = base - pit3 + g3;
                // helper อัปเดตฟิลด์ของ director แบบ immutable ปลอดภัย
                const patchDirector = (patch) => setData((s) => ({
                    ...s,
                    company: {
                        ...s.company,
                        directors: s.company.directors.map((x) => (x.id === d.id ? { ...x, ...patch } : x)),
                    },
                }));
                return (_jsx(Card, { children: _jsxs("details", { open: idx === 0, children: [_jsxs("summary", { className: "flex items-center justify-between cursor-pointer select-none", children: [_jsx("div", { className: "text-l", children: _jsx("span", { className: "text-[#EBDCA6] font-medium", children: d.name || `ผู้บริหาร ${idx + 1}` }) }), _jsx("div", { className: "text-xs text-[color:var(--ink-dim)] hover:text-gold", children: "\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39/\u0E0B\u0E48\u0E2D\u0E19" })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E0A\u0E37\u0E48\u0E2D/\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07" }), _jsx("input", { className: "w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60", value: d.name ?? '', onChange: e => patchDirector({ name: e.target.value }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 \u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23\u0E1C\u0E39\u0E49\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E40\u0E1E\u0E28" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: `sex-${d.id}`, className: "accent-gold", checked: sex === 'male', onChange: () => patchDirector({ sex: 'male' }) }), _jsx("span", { children: "\u0E0A\u0E32\u0E22" })] }), _jsxs("label", { className: "inline-flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "radio", name: `sex-${d.id}`, className: "accent-gold", checked: sex === 'female', onChange: () => patchDirector({ sex: 'female' }) }), _jsx("span", { children: "\u0E2B\u0E0D\u0E34\u0E07" })] })] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E2D\u0E32\u0E22\u0E38" }), _jsx("input", { type: "text", inputMode: "numeric", value: ageDraft[d.id] ?? '', onChange: (e) => {
                                                    const raw = e.target.value.replace(/[^\d]/g, '');
                                                    setAgeDraft(s => ({ ...s, [d.id]: raw }));
                                                }, onBlur: () => {
                                                    const raw = (ageDraft[d.id] ?? '').replace(/[^\d]/g, '');
                                                    if (raw === '') {
                                                        patchDirector({ age: undefined });
                                                        return;
                                                    }
                                                    let n = Math.floor(Number(raw));
                                                    if (!Number.isNaN(n)) {
                                                        n = Math.max(1, Math.min(80, n));
                                                        patchDirector({ age: n });
                                                        setAgeDraft(s => ({ ...s, [d.id]: String(n) }));
                                                    }
                                                }, placeholder: "\u0E40\u0E0A\u0E48\u0E19 35", className: "w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49 \u0E21.40(1) (\u0E1A\u0E32\u0E17/\u0E1B\u0E35)" }), _jsx(NumberInput, { value: emptyIfZero(d.annualSalary), onChange: (v) => patchDirector({ annualSalary: v ?? null }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 1,200,000" })] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E17\u0E38\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E0A\u0E35\u0E27\u0E34\u0E15 (\u0E1A\u0E32\u0E17)" }), _jsx(NumberInput, { value: sumAssured, onChange: (v) => patchDirector({ sumAssured: v ?? 0 }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 10,000,000" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: "\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19 (\u0E1A\u0E32\u0E17/\u0E1B\u0E35)" }), _jsx(NumberInput, { value: yearlyPremium, onChange: (v) => patchDirector({ personalInsurancePremium: v ?? 0 }), placeholder: "\u0E40\u0E0A\u0E48\u0E19 200,000" })] })] }), _jsx("div", { className: "mt-4 grid grid-cols-1 md:grid-cols-4 gap-4", children: [
                                    ['มูลค่ารับซื้อคืน ปีที่ 7', 'surrenderY7', surrY7],
                                    ['มูลค่ารับซื้อคืน เมื่ออายุ 60 ปี', 'surrenderAge60', surrAge60],
                                    ['มูลค่ารับซื้อคืน เมื่ออายุ 70 ปี', 'surrenderAge70', surrAge70],
                                    ['มูลค่ารับซื้อคืน เมื่ออายุ 99 ปี', 'surrenderAge99', surrAge99],
                                ].map(([label, key, val]) => (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)] mb-1", children: label }), _jsx(NumberInput, { value: val, onChange: (v) => patchDirector({ [key]: v ?? undefined }), placeholder: "*\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E08\u0E32\u0E01\u0E41\u0E2D\u0E1B\u0E2F" })] }, key))) }), _jsx("div", { className: "mt-4 text-[13px] text-[color:var(--ink-dim)]", children: "*\u0E01\u0E23\u0E2D\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E48\u0E19\u0E02\u0E2D\u0E07\u0E41\u0E15\u0E48\u0E25\u0E30\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2F \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E41\u0E2A\u0E14\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E43\u0E19\u0E15\u0E32\u0E23\u0E32\u0E07\u0E2A\u0E23\u0E38\u0E1B\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E14\u0E49\u0E32\u0E19\u0E25\u0E48\u0E32\u0E07" }), _jsxs("div", { className: "mt-4 text-xs text-[color:var(--ink-dim)]", children: ["\u0E1E\u0E23\u0E35\u0E27\u0E34\u0E27 \u0E20.\u0E07.\u0E14.91: \u0E40\u0E07\u0E34\u0E19\u0E2A\u0E38\u0E17\u0E18\u0E34/\u0E1B\u0E35 \u0E01\u0E48\u0E2D\u0E19\u0E2F ", fmt2(netY1), " \u2022 \u0E2B\u0E25\u0E31\u0E07\u0E2F\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22 ", fmt2(netY2), " \u2022 \u0E2B\u0E25\u0E31\u0E07\u0E2F\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22+\u0E20\u0E32\u0E29\u0E35\u0E41\u0E17\u0E19 ", fmt2(netY3)] }), _jsxs("div", { className: "mt-3 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 text-[#EBDCA6]", children: [recProductName || '-', " / \u0E0A\u0E33\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E49\u0E22 ", recPayYears || '-', " / \u0E04\u0E38\u0E49\u0E21\u0E04\u0E23\u0E2D\u0E07 ", recCoverage || '-'] })] }) }, d.id));
            })] }));
}
