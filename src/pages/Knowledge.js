import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Knowledge.tsx
import React from 'react';
import { RULINGS } from '../data/rulings';
export default function Knowledge() {
    const [q, setQ] = React.useState('');
    const filtered = React.useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t)
            return RULINGS;
        return RULINGS.filter((r) => {
            const hay = [r.docNo, r.cabinet, r.topic, r.summary]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return hay.includes(t);
        });
    }, [q]);
    return (_jsxs("main", { className: "mx-auto max-w-6xl px-6 py-10", children: [_jsx("h1", { className: "text-xl md:text-2xl font-semibold text-[#EBDCA6]", children: "\u0E04\u0E25\u0E31\u0E07 \u201C\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D\u0E01\u0E23\u0E21\u0E2A\u0E23\u0E23\u0E1E\u0E32\u0E01\u0E23\u201D" }), _jsx("p", { className: "mt-1 text-white/80", children: "\u0E04\u0E31\u0E14\u0E1B\u0E23\u0E30\u0E40\u0E14\u0E47\u0E19\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E1A Keyman / \u0E40\u0E1A\u0E35\u0E49\u0E22\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23 / \u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E15\u0E49\u0E2D\u0E07\u0E2B\u0E49\u0E32\u0E21 \u0E2F\u0E25\u0E2F \u0E04\u0E49\u0E19\u0E2B\u0E32\u0E14\u0E49\u0E27\u0E22 \u201C\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D, \u0E40\u0E25\u0E02\u0E15\u0E39\u0E49, \u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D, \u0E2A\u0E23\u0E38\u0E1B\u0E2A\u0E31\u0E49\u0E19\u201D" }), _jsxs("div", { className: "mt-4 flex items-center gap-2", children: [_jsx("input", { className: "w-full h-11 rounded-xl px-3 bp-input", placeholder: "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E49\u0E19\u0E2B\u0E32\u2026 \u0E40\u0E0A\u0E48\u0E19 0706/ \u0E2B\u0E23\u0E37\u0E2D \"\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23\"", value: q, onChange: (e) => setQ(e.target.value) }), q && (_jsx("button", { className: "bp-btn", onClick: () => setQ(''), children: "\u0E25\u0E49\u0E32\u0E07" }))] }), _jsxs("div", { className: "mt-6 space-y-4", children: [filtered.map((r, idx) => {
                        const key = r.docNo || `row-${idx}`;
                        return (_jsxs("article", { className: "rounded-2xl border border-white/10 bg-white/5 p-5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("a", { href: r.url, target: "_blank", rel: "noreferrer", className: "bp-btn", title: "\u0E40\u0E1B\u0E34\u0E14\u0E25\u0E34\u0E07\u0E01\u0E4C\u0E15\u0E49\u0E19\u0E17\u0E32\u0E07", children: r.docNo }), _jsxs("span", { className: "text-xs px-2 py-0.5 rounded-full ring-1 ring-white/15 bg-white/10", children: ["\u0E15\u0E39\u0E49 ", r.cabinet] })] }), _jsx("h3", { className: "mt-2 text-[17px] font-semibold text-[#EBDCA6]", children: r.topic }), _jsx("p", { className: "mt-2 text-sm text-white/90", children: r.summary }), _jsx("div", { className: "mt-3", children: _jsx("a", { href: r.url, target: "_blank", rel: "noreferrer", className: "bp-btn bp-btn-primary", children: "\u0E2D\u0E48\u0E32\u0E19\u0E09\u0E1A\u0E31\u0E1A\u0E40\u0E15\u0E47\u0E21" }) })] }, key));
                    }), filtered.length === 0 && (_jsx("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/80", children: "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E04\u0E33\u0E04\u0E49\u0E19\u0E2B\u0E32" }))] })] }));
}
