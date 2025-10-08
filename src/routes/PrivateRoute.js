import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
export default function PrivateRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) {
        return (_jsx("div", { className: "px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]", children: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u2026" }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname || '/' } });
    }
    return _jsx(Outlet, {});
}
