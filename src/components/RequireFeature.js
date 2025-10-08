import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useAuth } from '../lib/auth';
export default function RequireFeature({ feature, children, }) {
    const { user, ent, plan } = useAuth();
    // ป้องกันกรณีโปรเจ็กต์เก่า ent ยังไม่มี:
    // ถ้าไม่มี ent ให้เดาจาก plan ชั่วคราว (free/pro/ultra)
    const fallbackEnt = React.useMemo(() => {
        const p = (plan ?? 'free');
        return {
            export_pdf: p !== 'free',
            knowledge_full: p !== 'free',
            agent_identity_on_pdf: p !== 'free',
            custom_branding: p === 'ultra',
        };
    }, [plan]);
    const e = ent ?? fallbackEnt;
    const ok = !!user && !!e?.[feature];
    if (ok)
        return _jsx(_Fragment, { children: children });
    return (_jsxs("div", { className: "mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm", children: [_jsx("div", { className: "text-[#EBDCA6] font-medium mb-1", children: "\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E31\u0E1B\u0E40\u0E01\u0E23\u0E14\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" }), _jsxs("div", { className: "text-[color:var(--ink-dim)]", children: ["\u0E1F\u0E35\u0E40\u0E08\u0E2D\u0E23\u0E4C\u0E19\u0E35\u0E49\u0E2A\u0E07\u0E27\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E41\u0E1C\u0E19 ", _jsx("b", { children: "Pro" }), " \u0E2B\u0E23\u0E37\u0E2D ", _jsx("b", { children: "Ultra" }), " (", feature, ")"] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { onClick: () => (window.location.href = '/pricing'), className: "bp-btn bp-btn--sm", title: "\u0E14\u0E39\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08", children: "\u0E2D\u0E31\u0E1B\u0E40\u0E01\u0E23\u0E14\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" }), !user && (_jsx("button", { onClick: () => (window.location.href = '/login'), className: "bp-btn bp-btn--sm bp-btn--ghost", title: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A", children: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A" }))] })] }));
}
