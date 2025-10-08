import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/FontScalerFab.tsx
import React from 'react';
import { useAuth } from '../lib/auth';
function readScale() {
    const raw = localStorage.getItem('bp:scale');
    const n = raw ? Number(raw) : 1;
    return Number.isFinite(n) ? Math.min(1.4, Math.max(0.8, n)) : 1;
}
function applyScale(n) {
    const v = Math.min(1.4, Math.max(0.8, n));
    document.documentElement.style.setProperty('--bp-font-scale', String(v));
    localStorage.setItem('bp:scale', String(v));
}
export default function FontScalerFab() {
    const { plan, loading } = useAuth();
    const isProOrUltra = plan === 'pro' || plan === 'ultra';
    const [open, setOpen] = React.useState(false);
    const [scale, setScale] = React.useState(1);
    React.useEffect(() => {
        applyScale(readScale());
        setScale(readScale());
    }, []);
    if (loading || !isProOrUltra)
        return null;
    const setAndApply = (v) => {
        setScale(v);
        applyScale(v);
    };
    return (_jsxs("div", { className: "fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6", children: [open && (_jsxs("div", { className: "mb-2 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.35)] p-2 flex items-center gap-1", role: "group", "aria-label": "Font size controls", children: [_jsx("button", { className: "px-2 py-1 text-xs rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold", onClick: () => setAndApply(readScale() - 0.05), title: "\u0E25\u0E14\u0E02\u0E19\u0E32\u0E14\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", children: "A-" }), _jsx("button", { className: "px-2 py-1 text-xs rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold", onClick: () => setAndApply(1), title: "\u0E04\u0E37\u0E19\u0E04\u0E48\u0E32\u0E1B\u0E01\u0E15\u0E34", children: "A" }), _jsx("button", { className: "px-2 py-1 text-xs rounded-lg hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold", onClick: () => setAndApply(readScale() + 0.05), title: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E02\u0E19\u0E32\u0E14\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", children: "A+" }), _jsxs("span", { className: "ml-1 text-[11px] text-white/70 tabular-nums", children: [(scale * 100).toFixed(0), "%"] })] })), _jsx("button", { onClick: () => setOpen(v => !v), "aria-expanded": open, "aria-label": "Toggle font size panel", className: [
                    'inline-flex items-center justify-center',
                    'w-11 h-11 rounded-full',
                    'bg-[var(--brand-accent)] text-[#0B1B2B]',
                    'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
                    'hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
                ].join(' '), title: "\u0E1B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23 (PRO/ULTRA)", children: _jsx("span", { className: "font-bold text-lg", children: "A" }) })] }));
}
