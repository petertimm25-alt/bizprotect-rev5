import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
export default function RequireAuth({ children }) {
    const { user } = useAuth();
    const loc = useLocation();
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: loc.pathname } });
    }
    return _jsx(_Fragment, { children: children });
}
