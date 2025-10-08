import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import HeaderNav from '../components/HeaderNav';
export default function AppShell() {
    return (_jsxs("div", { className: "min-h-screen app-bg", children: [_jsx(HeaderNav, {}), _jsx(Outlet, {})] }));
}
