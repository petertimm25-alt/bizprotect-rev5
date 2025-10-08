import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
function Spinner() {
    return (_jsxs("svg", { className: "animate-spin h-4 w-4", viewBox: "0 0 24 24", "aria-hidden": "true", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none" }), _jsx("path", { className: "opacity-90", fill: "currentColor", d: "M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" })] }));
}
export default function Login() {
    const nav = useNavigate();
    const { signInWithEmail, envError } = useAuth();
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [ok, setOk] = React.useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        setOk(null);
        const trimmed = email.trim();
        if (!trimmed) {
            setError("กรุณากรอกอีเมล");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("รูปแบบอีเมลไม่ถูกต้อง");
            return;
        }
        try {
            setLoading(true);
            await signInWithEmail(trimmed);
            setOk("ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว — โปรดตรวจสอบกล่องจดหมาย");
        }
        catch (err) {
            setError(err?.message || "ส่งลิงก์ไม่สำเร็จ");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("section", { className: "max-w-xl mx-auto px-6 md:px-8 py-10 md:py-14", children: [_jsxs("div", { className: "flex flex-col items-center mb-6", children: [_jsx("img", { src: "public/brand/BizProtectLogo.png", alt: "BizProtect", className: "h-20 w-20 rounded-full border border-white/15 shadow mb-3" }), _jsx("h1", { className: "text-2xl font-semibold", style: { color: 'var(--brand-accent)' }, children: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A" }), _jsx("p", { className: "mt-1 text-white/70 text-sm", children: "Keyman Corporate Policy Calculator" })] }), _jsxs("form", { onSubmit: onSubmit, className: "rounded-2xl border border-white/10 bg-white/[.04] p-5 md:p-6", style: {
                    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.25)"
                }, noValidate: true, children: [_jsxs("label", { className: "block", children: [_jsx("div", { className: "mb-1 text-gold-2", children: "\u0E2D\u0E35\u0E40\u0E21\u0E25" }), _jsx("input", { id: "email", type: "email", className: "w-full h-11 md:h-12 rounded-xl px-3 bp-input", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email" })] }), envError && (_jsx("div", { className: "mt-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 text-yellow-100 px-3 py-2 text-sm", children: envError })), error && (_jsx("div", { className: "mt-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-3 py-2 text-sm", children: error })), ok && (_jsx("div", { className: "mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 px-3 py-2 text-sm", children: ok })), _jsxs("div", { className: "mt-5 flex flex-col gap-3", children: [_jsxs("button", { type: "submit", disabled: loading, className: "bp-btn-primary rounded-xl px-4 py-2 font-semibold inline-flex items-center justify-center gap-2", children: [loading && _jsx(Spinner, {}), "\u0E2A\u0E48\u0E07\u0E25\u0E34\u0E07\u0E01\u0E4C\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"] }), _jsx(Link, { to: "/pricing", className: "bp-btn rounded-xl px-4 py-2 text-center", children: "\u0E14\u0E39\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" })] }), _jsxs("p", { className: "mt-5 text-sm text-white/70", children: ["\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35?", " ", _jsx(Link, { to: "/pricing", className: "hover:opacity-90", style: { color: 'var(--brand-accent)' }, children: "\u0E14\u0E39\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E41\u0E25\u0E30\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19" })] })] }), _jsx("p", { className: "mt-4 text-center text-xs text-white/50", children: "\u0E40\u0E02\u0E49\u0E32\u0E23\u0E30\u0E1A\u0E1A\u0E19\u0E35\u0E49\u0E16\u0E37\u0E2D\u0E27\u0E48\u0E32\u0E22\u0E2D\u0E21\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E41\u0E25\u0E30\u0E19\u0E42\u0E22\u0E1A\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27\u0E02\u0E2D\u0E07 BizProtect" })] }));
}
