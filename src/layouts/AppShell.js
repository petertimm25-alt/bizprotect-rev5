import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
export default function AppShell() {
    return (_jsxs("div", { className: "min-h-screen bg-[#0B1B2B] text-white", children: [_jsx(HeaderNav, {}), _jsx("main", { className: "pt-16", children: _jsx(Outlet, {}) }), _jsx("footer", { className: "mt-14 border-t border-white/10", children: _jsxs("div", { className: "mx-auto max-w-6xl px-6 py-6 text-xs text-white/60", children: ["\u00A9 ", new Date().getFullYear(), " BizProtect \u2022 All rights reserved."] }) })] }));
}
