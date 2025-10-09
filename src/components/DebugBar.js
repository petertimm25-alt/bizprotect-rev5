import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useAuth } from '../lib/auth';
function useDebugEnabled() {
    const [on, setOn] = React.useState(false);
    React.useEffect(() => {
        const urlHas = new URLSearchParams(location.search).has('debug');
        const ls = localStorage.getItem('bp:debug') === '1';
        setOn(urlHas || ls);
    }, []);
    return on;
}
export default function DebugBar() {
    const show = useDebugEnabled();
    const { user, plan, ent } = useAuth();
    if (!show)
        return null;
    return (_jsxs("div", { className: "w-full bg-black/60 text-[11px] text-white/90 px-3 py-2 flex flex-wrap gap-3", children: [_jsx("span", { children: "DEBUG" }), _jsxs("span", { children: ["email: ", _jsx("b", { children: user?.email || '-' })] }), _jsxs("span", { children: ["plan: ", _jsx("b", { children: plan })] }), _jsxs("span", { children: ["export_pdf: ", _jsx("b", { children: String(ent.export_pdf) })] }), _jsxs("span", { children: ["directorsMax: ", _jsx("b", { children: ent.directorsMax })] })] }));
}
