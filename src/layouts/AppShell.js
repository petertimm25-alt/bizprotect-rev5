import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
import { useAuth } from '../lib/auth';
function DebugBar() {
    const { user, plan, ent, loading } = useAuth();
    return (_jsxs("div", { className: "text-xs bg-black/70 text-green-300 px-4 py-1 font-mono", children: [_jsxs("div", { children: ["loading: ", String(loading)] }), _jsxs("div", { children: ["user: ", user ? `${user.email} (${user.id.slice(0, 6)})` : 'null'] }), _jsxs("div", { children: ["plan: ", plan] }), _jsxs("div", { children: ["ent.export_pdf: ", String(ent?.export_pdf)] }), _jsxs("div", { children: ["ent.directorsMax: ", ent?.directorsMax] })] }));
}
export default function AppShell() {
    return (_jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(HeaderNav, {}), _jsx(DebugBar, {}), _jsx("main", { className: "flex-1", children: _jsx(Outlet, {}) })] }));
}
