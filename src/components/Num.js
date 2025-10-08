import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function fmt0(n) {
    return n === undefined || Number.isNaN(n)
        ? '-'
        : n.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
export function fmt2(n) {
    return n === undefined || Number.isNaN(n)
        ? '-'
        : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export const emptyIfZero = (n) => (n === 0 ? undefined : n);
export default function Num({ v, forceNeg }) {
    if (v === undefined || Number.isNaN(v))
        return _jsx("span", { className: "block text-right", children: "-" });
    const neg = forceNeg === true || v < 0;
    const absVal = Math.abs(v);
    const txt = absVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (_jsxs("span", { className: ['block text-right tabular-nums', neg ? 'text-[#FF7B7B]' : ''].join(' '), children: [neg ? '-' : '', txt] }));
}
