import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 11 },
    h1: { fontSize: 18, marginBottom: 8 },
    h2: { fontSize: 14, marginTop: 14, marginBottom: 6 },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    label: { color: "#666" },
    strong: { fontSize: 12 },
    table: { marginTop: 8, borderTop: 1, borderColor: "#DDD" },
    tr: { flexDirection: "row", borderBottom: 1, borderColor: "#EEE" },
    th: { flex: 1, paddingVertical: 6, fontSize: 10, color: "#666" },
    td: { flex: 1, paddingVertical: 6 },
});
function fmt(n) {
    if (n === undefined || Number.isNaN(n))
        return "-";
    return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function compute(state) {
    const c = state.company;
    const ds = c.directors;
    const income = c.companyIncome ?? 0;
    const expense = c.companyExpense ?? 0;
    const interest = c.interestExpense ?? 0;
    const actualCIT = c.actualCIT ?? 0;
    const personalExpense = 100000;
    const personalAllowance = 160000;
    const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0);
    // gross-up per director
    const progressiveGrossUp = (base, prem, deduction) => {
        // โมเดลเดียวกับหน้า Engine แบบย่อ (ประมาณการเชิงเส้นระดับชั้นภาษี)
        const brackets = [
            [150000, 0],
            [150000, 0.05],
            [200000, 0.10],
            [250000, 0.15],
            [250000, 0.20],
            [1000000, 0.25],
            [floatMax(), 0.35],
        ];
        function floatMax() { return 9e15; }
        const baseTaxable = Math.max(0, base - deduction);
        const add = prem;
        const step = 500; // granularity
        let g = 0;
        let addSoFar = 0;
        while (addSoFar < add) {
            const chunk = Math.min(step, add - addSoFar);
            const taxable = baseTaxable + g + chunk;
            const rate = marginalRate(taxable, brackets);
            g += chunk * rate / (1 - rate);
            addSoFar += chunk;
        }
        return g;
    };
    const marginalRate = (taxable, b) => {
        let left = taxable;
        let acc = 0;
        for (const [width, rate] of b) {
            const take = Math.max(0, Math.min(left, width));
            acc += take * rate;
            left -= take;
            if (left <= 0)
                return rate;
        }
        return b[b.length - 1][1];
    };
    const gus = ds.map(d => progressiveGrossUp(d.annualSalary ?? 0, d.personalInsurancePremium ?? 0, personalExpense + personalAllowance));
    const totalGrossUp = gus.reduce((s, g) => s + g, 0);
    const CIT_RATE = 0.20;
    const pbt_before = income - expense - interest;
    const pbt_afterPrem = income - totalPremium - expense - interest;
    const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest;
    const cit_before = Math.max(0, pbt_before) * CIT_RATE;
    const disallow_tax_before = Math.max(0, actualCIT - cit_before);
    const disallow_base = disallow_tax_before / CIT_RATE;
    const disallow_afterPrem = Math.max(0, disallow_base - totalPremium);
    const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp);
    const disallow_tax_afterPrem = disallow_afterPrem * CIT_RATE;
    const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE;
    const trueTax_before = actualCIT;
    const trueTax_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE + disallow_tax_afterPrem;
    const trueTax_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE + disallow_tax_afterPremGross;
    const taxSaved_afterPrem = Math.max(0, trueTax_before - trueTax_afterPrem);
    const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross);
    const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0;
    return {
        c, ds, income, expense, interest, actualCIT,
        totalPremium, totalGrossUp,
        pbt_before, pbt_afterPrem, pbt_afterPremGross,
        trueTax_before, trueTax_afterPrem, trueTax_afterPremGross,
        taxSaved_afterPremGross, taxSavedPct_afterPremGross
    };
}
function ProposalDoc({ state }) {
    const T = compute(state);
    const taxYear = state.company.taxYear || new Date().getFullYear() + 543;
    return (_jsx(Document, { children: _jsxs(Page, { size: "A4", style: styles.page, children: [_jsx(Text, { style: styles.h1, children: "BizProtect \u2014 Executive Tax Proposal" }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17:" }), _jsx(Text, { style: styles.strong, children: T.c.name || "—" })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E1B\u0E35\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07:" }), _jsx(Text, { style: styles.strong, children: taxYear })] }), _jsx(Text, { style: styles.h2, children: "Executive Summary" }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E01\u0E33\u0E44\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E20\u0E32\u0E29\u0E35" }), _jsx(Text, { children: fmt(T.pbt_before) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E01\u0E33\u0E44\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E20\u0E32\u0E29\u0E35 (\u0E2B\u0E25\u0E31\u0E07\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19)" }), _jsx(Text, { children: fmt(T.pbt_afterPremGross) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E20\u0E32\u0E29\u0E35\u0E07\u0E1A\u0E08\u0E23\u0E34\u0E07" }), _jsx(Text, { children: fmt(T.trueTax_before) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E20\u0E32\u0E29\u0E35 (\u0E2B\u0E25\u0E31\u0E07\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19)" }), _jsx(Text, { children: fmt(T.trueTax_afterPremGross) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E20\u0E32\u0E29\u0E35\u0E25\u0E14\u0E25\u0E07 (\u0E2B\u0E25\u0E31\u0E07\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19)" }), _jsxs(Text, { children: [fmt(T.taxSaved_afterPremGross), " (", T.taxSavedPct_afterPremGross.toFixed(2), "%)"] })] }), _jsx(Text, { style: styles.h2, children: "\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23 (\u0E1B\u0E35)" }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E23\u0E27\u0E21\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19" }), _jsx(Text, { children: fmt(T.totalPremium) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19\u0E17\u0E38\u0E01\u0E17\u0E2D\u0E14 (\u0E23\u0E27\u0E21)" }), _jsx(Text, { children: fmt(T.totalGrossUp) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { children: "\u0E23\u0E27\u0E21\u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19" }), _jsx(Text, { children: fmt(T.totalPremium + T.totalGrossUp) })] })] }) }));
}
export default function ExportProposalPDF({ state, fileName = "BizProtect-Proposal.pdf", compact = false, }) {
    const makeBlob = async () => {
        const blob = await pdf(_jsx(ProposalDoc, { state: state })).toBlob();
        return blob;
    };
    const handlePreview = async () => {
        try {
            const blob = await makeBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        }
        catch {
            alert("สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        }
    };
    const handleDownload = async () => {
        try {
            const blob = await makeBlob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        }
        catch {
            alert("สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        }
    };
    return (_jsxs("div", { className: compact ? "" : "flex items-center gap-2", children: [_jsx("button", { onClick: handlePreview, className: "px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10", children: "\u0E1E\u0E23\u0E35\u0E27\u0E34\u0E27 Proposal" }), !compact && (_jsx("button", { onClick: handleDownload, className: "px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10", children: "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14 PDF" }))] }));
}
