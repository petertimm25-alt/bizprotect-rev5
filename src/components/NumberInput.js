import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
function parseNumber(s) { if (!s)
    return undefined; const cleaned = s.replace(/[^0-9.,-]/g, '').replace(/,/g, ''); const n = Number(cleaned); return Number.isFinite(n) ? n : undefined; }
export default function NumberInput({ value, onChange, placeholder, className }) {
    const [text, setText] = React.useState(value !== undefined ? value.toLocaleString('th-TH') : '');
    React.useEffect(() => { setText(value !== undefined ? value.toLocaleString('th-TH') : ''); }, [value]);
    return _jsx("input", { inputMode: "decimal", className: ['w-full rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-gold/60', className].join(' '), placeholder: placeholder, value: text, onChange: (e) => { const v = parseNumber(e.target.value); setText(e.target.value); onChange(v); }, onBlur: () => { const v = parseNumber(text); setText(v !== undefined ? v.toLocaleString('th-TH') : ''); } });
}
