import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fmt2 } from '../../components/Num';
/** เลื่อนไปยัง section ตาม id (ไม่เปลี่ยนหน้า) */
function go(id) {
    const el = document.getElementById(id);
    if (!el)
        return;
    try {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    catch {
        const y = el.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}
export default function StickySummary({ taxYear, currentThaiYear, setTaxYear, taxSaved_afterPremGross, taxSavedPct_afterPremGross, combinedCost, rightSlot, }) {
    return (_jsx("div", { className: "sticky top-0 z-40 -mx-6 px-6 py-3 bg-[color:var(--page)]/85 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--page)]/60 border-b border-white/10", children: _jsxs("div", { className: "max-w-6xl mx-auto flex flex-wrap items-center gap-3", children: [_jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2 min-w-0", children: [_jsxs("label", { className: "text-sm text-[color:var(--ink-dim)] flex items-center gap-2", children: ["\u0E1B\u0E35\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07:", _jsx("input", { type: "number", inputMode: "numeric", className: "w-24 rounded bg-white/5 px-2 py-1 ring-1 ring-white/10 text-right text-[color:var(--ink)] outline-none focus:ring-gold/60", value: taxYear ?? currentThaiYear, placeholder: String(currentThaiYear), onChange: (e) => {
                                        const v = e.target.value.trim();
                                        setTaxYear(v === '' ? undefined : Number(v));
                                    } })] }), _jsxs("div", { className: "ml-2 flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => go('company-sec'), className: "bp-btn bp-btn--sm bp-btn--ghost hover:text-[#EBDCA6]", children: "\u0E44\u0E1B\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17" }), _jsx("button", { type: "button", onClick: () => go('directors-sec'), className: "bp-btn bp-btn--sm bp-btn--ghost hover:text-[#EBDCA6]", children: "\u0E44\u0E1B\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23" }), _jsx("button", { type: "button", onClick: () => go('cit-table-sec'), className: "bp-btn bp-btn--sm bp-btn--ghost hover:text-[#EBDCA6]", children: "\u0E44\u0E1B\u0E15\u0E32\u0E23\u0E32\u0E07 \u0E20.\u0E07.\u0E14.50" }), _jsx("button", { type: "button", onClick: () => go('return-sec'), className: "bp-btn bp-btn--sm bp-btn--ghost hover:text-[#EBDCA6]", children: "\u0E44\u0E1B\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C" })] })] }), _jsx("div", { className: "ml-auto flex items-center", children: rightSlot }), _jsxs("div", { className: "w-full grid grid-cols-2 md:grid-cols-2 gap-3 mt-3", children: [_jsxs("div", { className: "rounded-lg bg-white/5 p-3", children: [_jsx("div", { className: "text-m font-semibold text-gold-2", children: "\u0E20\u0E32\u0E29\u0E35\u0E25\u0E14\u0E25\u0E07 (\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E2F)" }), _jsxs("div", { className: "text-m font-semibold text-right text-gold", children: [fmt2(taxSaved_afterPremGross), ' ', _jsxs("span", { className: "text-l text-white/80", children: ["(", (taxSavedPct_afterPremGross || 0).toFixed(2), "%)"] })] })] }), _jsxs("div", { className: "rounded-lg bg-white/5 p-3", children: [_jsx("div", { className: "text-m font-semibold text-gold-2", children: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22(\u0E40\u0E1A\u0E35\u0E49\u0E22+\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19)" }), _jsx("div", { className: "text-l font-semibold text-right text-gold", children: fmt2(combinedCost) })] })] })] }) }));
}
