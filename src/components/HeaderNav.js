import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/HeaderNav.tsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
const BASE = import.meta?.env?.BASE_URL || '/';
const LockIcon = ({ className = 'w-4 h-4' }) => (_jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", className: className, children: _jsx("path", { fill: "currentColor", d: "M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2H10V6Zm8 12H7v-8h10v8Z" }) }));
const Burger = ({ open }) => (_jsxs("span", { className: "inline-block w-5 h-5 relative", "aria-hidden": "true", children: [_jsx("span", { className: [
                'absolute left-0 right-0 h-[2px] bg-current transition-transform',
                open ? 'top-2.5 rotate-45' : 'top-1',
            ].join(' ') }), _jsx("span", { className: [
                'absolute left-0 right-0 h-[2px] bg-current transition-opacity',
                open ? 'opacity-0' : 'top-2.5 opacity-100',
            ].join(' ') }), _jsx("span", { className: [
                'absolute left-0 right-0 h-[2px] bg-current transition-transform',
                open ? 'top-2.5 -rotate-45' : 'top-4',
            ].join(' ') })] }));
const PlanBadge = ({ plan }) => {
    const color = plan === 'ultra'
        ? 'bg-purple-500/20 text-purple-200 ring-purple-400/30'
        : plan === 'pro'
            ? 'bg-[var(--brand-accent)]/20 text-[var(--brand-accent)] ring-[var(--brand-accent)]/30'
            : 'bg-white/10 text-white/80 ring-white/20';
    return (_jsx("span", { className: [
            'ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1',
            color,
        ].join(' '), title: `แผน: ${plan.toUpperCase()}`, children: plan }));
};
export default function HeadNav() {
    const { user, signOut, loading, envReady, envError, ent, plan } = useAuth();
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    // ปิดเมนูเมื่อเปลี่ยนเส้นทาง (กันค้าง)
    React.useEffect(() => {
        const close = () => setOpen(false);
        window.addEventListener('hashchange', close);
        return () => window.removeEventListener('hashchange', close);
    }, []);
    const baseLink = 'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-[#EBDCA6] hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold';
    const activeClass = ({ isActive }) => [
        baseLink,
        isActive ? 'text-[#EBDCA6] bg-white/5 ring-1 ring-gold/30' : '',
    ].join(' ');
    // ลิงก์คลังข้อหารือ: เปิดได้เฉพาะ ent.knowledge_full (ULTRA)
    const KnowledgeLink = () => {
        if (ent.knowledge_full) {
            return (_jsx(NavLink, { to: "/knowledge", className: activeClass, children: "\u0E04\u0E25\u0E31\u0E07\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D" }));
        }
        return (_jsxs("button", { type: "button", className: [baseLink, 'opacity-90'].join(' '), onClick: () => navigate('/pricing'), title: "\u0E1F\u0E35\u0E40\u0E08\u0E2D\u0E23\u0E4C\u0E40\u0E09\u0E1E\u0E32\u0E30 Ultra \u2014 \u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08", children: [_jsx(LockIcon, {}), "\u0E04\u0E25\u0E31\u0E07\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D"] }));
    };
    return (_jsxs(_Fragment, { children: [!envReady && (_jsx("div", { className: "w-full bg-red-500/15 text-red-200 text-xs text-center py-2", children: envError || 'Environment ยังไม่พร้อม — โปรดตั้งค่า .env.local' })), _jsxs("header", { className: "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-[#0B1B2B]/70 bg-[#0B1B2B]/90 border-b border-white/10", children: [_jsx("div", { className: "mx-auto max-w-6xl px-4 md:px-6", children: _jsxs("div", { className: "h-14 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", "aria-label": "BizProtect Home", children: [_jsx("img", { src: `${BASE}brand/BizProtectLogo.png`, alt: "BizProtect", className: "h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain" }), _jsx("span", { className: "hidden sm:inline text-sm font-semibold tracking-wide text-[#EBDCA6]", children: "BizProtect" })] }), _jsxs("nav", { className: "hidden md:flex items-center gap-1 ml-2", children: [_jsx(NavLink, { to: "/", end: true, className: activeClass, children: "Home" }), _jsx(NavLink, { to: "/dashboard", className: activeClass, children: "Calculator" }), _jsx(KnowledgeLink, {})] })] }), _jsx("div", { className: "hidden md:flex items-center gap-2", children: loading ? (_jsx("div", { className: "text-xs text-white/70 animate-pulse px-3 py-1.5 rounded-lg bg-white/5", children: "Loading\u2026" })) : user ? (_jsxs(_Fragment, { children: [_jsxs("span", { className: "text-sm text-white/85 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10", children: [user.email || 'user', _jsx(PlanBadge, { plan: plan })] }), _jsx("button", { onClick: () => signOut(), className: "text-sm rounded-lg px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold", title: "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A", children: "Logout" })] })) : (_jsx(Link, { to: "/login", className: "text-sm rounded-lg px-3 py-1.5 ring-1 ring-gold/40 text-gold hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold", children: "Login" })) }), _jsx("button", { className: "md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg ring-1 ring-white/15 hover:bg-white/10", onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-controls": "mobile-nav", "aria-label": "Toggle navigation", children: _jsx(Burger, { open: open }) })] }) }), _jsx("div", { id: "mobile-nav", className: [
                            'md:hidden border-t border-white/10 transition-[max-height]',
                            open ? 'max-h-72' : 'max-h-0 overflow-hidden',
                        ].join(' '), children: _jsxs("div", { className: "px-4 py-2 space-y-1", children: [_jsx(NavLink, { to: "/", end: true, className: activeClass, onClick: () => setOpen(false), children: "Home" }), _jsx(NavLink, { to: "/dashboard", className: activeClass, onClick: () => setOpen(false), children: "Calculator" }), _jsx("div", { onClick: () => setOpen(false), children: _jsx(KnowledgeLink, {}) }), _jsx("div", { className: "pt-2 border-t border-white/10 mt-2", children: loading ? (_jsx("div", { className: "text-xs text-white/70 px-3 py-1.5", children: "Loading\u2026" })) : user ? (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-sm text-white/85 px-3 py-1.5 rounded-lg bg-white/5 ring-1 ring-white/10", children: [user.email || 'user', _jsx(PlanBadge, { plan: plan })] }), _jsx("button", { onClick: () => {
                                                    setOpen(false);
                                                    void signOut();
                                                }, className: "ml-2 text-sm rounded-lg px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/10", children: "Logout" })] })) : (_jsx(Link, { to: "/login", onClick: () => setOpen(false), className: "mt-2 inline-flex justify-center items-center text-sm rounded-lg px-3 py-1.5 ring-1 ring-gold/40 text-gold hover:bg-gold/10 w-full", children: "Login" })) })] }) })] })] }));
}
