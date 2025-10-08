import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/FeatureGuard.tsx
import React from 'react';
import { useAuth } from '../lib/auth';
import { hasFeature } from '../lib/roles';
import { Link } from 'react-router-dom';
/**
 * ใช้ล้อมส่วนที่ต้องมีสิทธิ์ เช่น:
 * <FeatureGuard need="custom_branding"> ... </FeatureGuard>
 * หรือหลายสิทธิ์: need={['export_pdf','no_watermark']}
 */
export default function FeatureGuard({ need, children, fallback }) {
    const { plan } = useAuth();
    const ok = React.useMemo(() => {
        if (!need)
            return true;
        const arr = Array.isArray(need) ? need : [need];
        return arr.every((k) => hasFeature(plan, k));
    }, [plan, need]);
    if (ok)
        return _jsx(_Fragment, { children: children });
    return (_jsx(_Fragment, { children: fallback ?? (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/80", children: ["\u0E2A\u0E48\u0E27\u0E19\u0E19\u0E35\u0E49\u0E2A\u0E07\u0E27\u0E19\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08\u0E17\u0E35\u0E48\u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32 \u2014", ' ', _jsx(Link, { to: "/pricing", className: "text-[#EBDCA6] underline decoration-[#EBDCA6]/60", children: "\u0E2D\u0E31\u0E1B\u0E40\u0E01\u0E23\u0E14\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" })] })) }));
}
