import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/auth';
export default function AuthCallback() {
    const nav = useNavigate();
    const loc = useLocation();
    React.useEffect(() => {
        async function run() {
            try {
                if (!supabase)
                    throw new Error('Supabase is not ready');
                const hash = window.location.hash;
                if (!hash || (!hash.includes('access_token') && !hash.includes('code'))) {
                    // บางอุปกรณ์ส่งเป็น query ?code=
                    const qs = new URLSearchParams(window.location.search);
                    if (!qs.get('code'))
                        throw new Error('ลิงก์ไม่ถูกต้อง: ไม่พบ code หรือ token');
                }
                // Supabase JS จะ sync session เอง → รอสั้นๆ แล้วนำทาง
                setTimeout(() => {
                    const state = loc.state || {};
                    const to = state.from || '/dashboard';
                    nav(to, { replace: true });
                }, 400);
            }
            catch {
                nav('/login', { replace: true });
            }
        }
        run();
    }, [nav, loc.state]);
    return (_jsx("div", { className: "px-6 py-10 text-center text-sm text-[color:var(--ink-dim)]", children: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u2026" }));
}
