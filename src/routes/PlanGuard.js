import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../lib/auth';
// อ่าน override (สำหรับเทส) จาก localStorage ก่อน ถ้าไม่มีค่อยใช้ของ user
function getEffectivePlan(userPlan) {
    const ov = (typeof window !== 'undefined' ? localStorage.getItem('bp:plan') : '') || '';
    const low = ov.toLowerCase();
    if (low === 'free' || low === 'pro' || low === 'ultra')
        return low;
    return (userPlan ?? 'free');
}
export default function PlanGuard({ requirePlan = 'ultra', children }) {
    const { user, loading } = useAuth();
    const plan = getEffectivePlan(user?.plan);
    if (loading) {
        return (_jsx("div", { className: "px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]", children: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u2026" }));
    }
    // ปกติจะถูกห่อด้วย <PrivateRoute/> อยู่แล้ว ถ้าไม่มี user ก็ไม่ต้องแสดงอะไร
    if (!user)
        return null;
    const ok = requirePlan === 'ultra' ? plan === 'ultra'
        : requirePlan === 'pro' ? (plan === 'pro' || plan === 'ultra')
            : true;
    if (ok)
        return _jsx(_Fragment, { children: children });
    // ไม่ redirect → แสดงการ์ดอัปเกรดแทน (จะไม่มีกระพริบ/วนลูป)
    return (_jsx("main", { className: "max-w-3xl mx-auto px-6 py-10", children: _jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-gold", children: "\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E31\u0E1B\u0E40\u0E01\u0E23\u0E14\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" }), _jsxs("p", { className: "mt-2 text-sm text-white/85", children: ["\u0E40\u0E19\u0E37\u0E49\u0E2D\u0E2B\u0E32\u0E2A\u0E48\u0E27\u0E19\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E2B\u0E49\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01 ", _jsx("b", { children: requirePlan.toUpperCase() }), " \u0E02\u0E36\u0E49\u0E19\u0E44\u0E1B\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19", _jsx("br", {}), "\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13: ", _jsx("b", { children: String(plan).toUpperCase() })] }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("a", { href: "/pricing", className: "bp-btn bp-btn-primary", children: "\u0E14\u0E39\u0E41\u0E1E\u0E47\u0E01\u0E40\u0E01\u0E08" }), _jsx("a", { href: "/dashboard", className: "bp-btn", children: "\u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E21\u0E37\u0E2D" })] })] }) }));
}
