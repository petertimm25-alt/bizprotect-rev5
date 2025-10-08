import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
const BASE = import.meta?.env?.BASE_URL || '/';
// รองรับ React Router v6 (className เป็นฟังก์ชัน)
const pillClass = ({ isActive }) => ['bp-btn', isActive ? 'bp-btn--active' : ''].join(' ');
function getEffectivePlan(userPlan) {
    const ov = (localStorage.getItem('bp:plan') || '').toLowerCase();
    if (ov === 'free' || ov === 'pro' || ov === 'ultra')
        return ov;
    return (userPlan ?? 'free');
}
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
export default function HeaderNav() {
    const auth = useAuth();
    const user = auth?.user ?? null;
    const plan = getEffectivePlan(user?.plan);
    const isProOrUltra = plan === 'pro' || plan === 'ultra';
    React.useEffect(() => { applyScale(readScale()); }, []);
    const handleLogout = React.useCallback(async () => {
        try {
            if (typeof auth?.signOut === 'function')
                await auth.signOut();
            else if (typeof auth?.logout === 'function')
                await auth.logout();
        }
        catch { }
    }, [auth]);
    return (_jsxs("header", { className: "mx-auto max-w-6xl px-6 py-6 flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", "aria-label": "BizProtect Home", children: [_jsx("img", { src: `${BASE}brand/BizProtectLogo.png`, alt: "BizProtect", className: "h-12 w-12 object-contain" }), _jsx("span", { className: "text-xl sm:text-2xl font-semibold", style: { color: 'var(--brand-accent)' }, children: "BizProtect" })] }), _jsxs("nav", { className: "bp-nav", children: [_jsx(NavLink, { to: "/", className: pillClass, children: "\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01" }), _jsx(NavLink, { to: "/dashboard", className: pillClass, children: "Calculator" }), _jsx(NavLink, { to: "/pricing", className: pillClass, children: "\u0E41\u0E1E\u0E25\u0E19" }), _jsx(NavLink, { to: "/knowledge", className: pillClass, children: "\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D\u0E2F" })] }), _jsxs("div", { className: "bp-nav", children: [isProOrUltra && (_jsxs("div", { className: "hidden sm:flex items-center gap-1 rounded-full border border-gold/60 bg-white/5 px-2 py-1 shadow-[0_0_0_1px_rgba(212,175,55,0.25),0_6px_18px_rgba(0,0,0,0.18)]", title: "\u0E1B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23\u0E17\u0E31\u0E49\u0E07\u0E40\u0E27\u0E47\u0E1A\u0E44\u0E0B\u0E15\u0E4C (PRO/ULTRA)", children: [_jsx("button", { onClick: () => applyScale(readScale() - 0.05), className: "px-2 py-1 text-xs", children: "A-" }), _jsx("button", { onClick: () => applyScale(1), className: "px-2 py-1 text-xs", children: "A" }), _jsx("button", { onClick: () => applyScale(readScale() + 0.05), className: "px-2 py-1 text-xs", children: "A+" })] })), user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "text-[11px] sm:text-xs px-3 py-1 rounded-full bg-white/10 ring-1 ring-white/15", children: [user.email ?? 'ผู้ใช้', " \u2022 ", String(plan).toUpperCase()] }), _jsx("button", { onClick: handleLogout, className: "bp-btn", children: "Logout" })] })) : (_jsx(Link, { to: "/login", className: "bp-btn bp-btn-primary", children: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A" }))] })] }));
}
