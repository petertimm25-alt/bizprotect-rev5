import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax';
import { RULINGS } from '../data/rulings';
// สีตามธีม
const NAVY = '#1A2A4F';
const GOLD = '#D4AF37';
const RED = '#D95C5C';
const INK = '#111111';
const INK_DIM = '#444444';
// สไตล์ PDF
const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 10, color: INK },
    h1: { fontSize: 18, marginBottom: 8, color: GOLD },
    h2: { fontSize: 14, marginTop: 12, marginBottom: 6, color: NAVY },
    p: { fontSize: 10, color: INK_DIM, marginBottom: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    table: { borderWidth: 0.5, borderColor: '#CCCCCC', width: '100%', marginTop: 6 },
    thead: { backgroundColor: NAVY, color: '#FFFFFF', flexDirection: 'row' },
    th: { flex: 1, padding: 6, fontSize: 10, fontWeight: 700 },
    tdrow: { flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#DDDDDD' },
    td: { flex: 1, padding: 6, fontSize: 10 },
    tdRight: { textAlign: 'right' },
    neg: { color: RED },
    hi: { color: GOLD, fontWeight: 700 },
    small: { fontSize: 9, color: INK_DIM },
});
function fmt(n) {
    if (n === undefined || Number.isNaN(n))
        return '-';
    return n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export default function PDFProposal({ state }) {
    const c = state.company;
    const ds = c.directors;
    const income = c.companyIncome ?? 0;
    const expense = c.companyExpense ?? 0;
    const interest = c.interestExpense ?? 0;
    const citRate = c.corporateTaxRate ?? 0.20;
    // ส่วนบุคคล
    const personalExpense = 100000;
    const personalAllowance = 160000;
    const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0);
    // progressive gross-up per director
    const gus = ds.map(d => {
        const base = d.annualSalary ?? 0;
        const prem = d.personalInsurancePremium ?? 0;
        const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance);
        const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance));
        const r = marginalRate(taxable);
        return { name: d.name, rate: r, g };
    });
    const totalGrossUp = gus.reduce((s, g) => s + g.g, 0);
    // CIT summary (หักดอกเบี้ยจ่าย)
    const pbt_before = income - expense - interest;
    const pbt_afterPrem = income - totalPremium - expense - interest;
    const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest;
    const citBefore = Math.max(0, pbt_before) * citRate;
    const citPrem = Math.max(0, pbt_afterPrem) * citRate;
    const citGross = Math.max(0, pbt_afterPremGross) * citRate;
    const taxSavedPrem = (Math.max(0, pbt_before) - Math.max(0, pbt_afterPrem)) * citRate;
    const taxSavedGross = (Math.max(0, pbt_before) - Math.max(0, pbt_afterPremGross)) * citRate;
    const pctSavedPrem = (citBefore > 0 ? ((citBefore - citPrem) / citBefore) * 100 : undefined);
    const pctSavedGross = (citBefore > 0 ? ((citBefore - citGross) / citBefore) * 100 : undefined);
    const netAfterBefore = pbt_before - citBefore;
    const netAfterPrem = pbt_afterPrem - citPrem;
    const netAfterGross = pbt_afterPremGross - citGross;
    return (_jsx(Document, { children: _jsxs(Page, { size: "A4", style: styles.page, children: [_jsx(Text, { style: styles.h1, children: "BizProtect \u2014 Executive Tax Proposal" }), _jsx(Text, { style: styles.p, children: "\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E01\u0E32\u0E23\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E19\u0E20\u0E32\u0E29\u0E35\u0E14\u0E49\u0E27\u0E22\u0E2A\u0E27\u0E31\u0E2A\u0E14\u0E34\u0E01\u0E32\u0E23\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E41\u0E25\u0E30\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19 (Gross-up) \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23" }), _jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17" }), _jsxs(View, { style: styles.row, children: [_jsxs(Text, { style: styles.p, children: ["\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17: ", c.name || '-'] }), _jsxs(Text, { style: styles.p, children: ["\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E19\u0E34\u0E15\u0E34\u0E1A\u0E38\u0E04\u0E04\u0E25 (CIT): ", (citRate * 100).toFixed(1), "%"] })] }), _jsxs(View, { style: styles.row, children: [_jsxs(Text, { style: styles.p, children: ["\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E23\u0E27\u0E21: ", fmt(income), " \u0E1A\u0E32\u0E17/\u0E1B\u0E35"] }), _jsxs(Text, { style: styles.p, children: ["\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E23\u0E27\u0E21: ", fmt(expense), " \u0E1A\u0E32\u0E17/\u0E1B\u0E35"] })] }), _jsxs(View, { style: styles.row, children: [_jsxs(Text, { style: styles.p, children: ["\u0E14\u0E2D\u0E01\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E08\u0E48\u0E32\u0E22: ", fmt(interest), " \u0E1A\u0E32\u0E17/\u0E1B\u0E35"] }), _jsxs(Text, { style: styles.p, children: ["\u0E23\u0E27\u0E21\u0E40\u0E1A\u0E35\u0E49\u0E22 (\u0E17\u0E38\u0E01\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23): ", fmt(totalPremium), " \u0E1A\u0E32\u0E17/\u0E1B\u0E35"] })] }), _jsxs(Text, { style: styles.p, children: ["\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19 (\u0E23\u0E27\u0E21): ", fmt(totalGrossUp), " \u0E1A\u0E32\u0E17/\u0E1B\u0E35"] }), _jsx(Text, { style: styles.h2, children: "\u0E20.\u0E07.\u0E14.50 \u0E02\u0E2D\u0E07\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E08\u0E33\u0E01\u0E31\u0E14" }), _jsxs(View, { style: [styles.table, styles.thead], children: [_jsx(Text, { style: [styles.th, { flex: 1.4 }], children: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E01\u0E48\u0E2D\u0E19\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E41\u0E17\u0E19" })] }), [
                    ['รายได้รวม (บาท/ปี)', fmt(income), fmt(income), fmt(income)],
                    ['เบี้ยประกันฯ นิติบุคคล (บาท/ปี)', fmt(0), fmt(totalPremium), fmt(totalPremium)],
                    ['ค่าภาษีออกแทนทุกทอด (บาท/ปี)', fmt(0), fmt(0), fmt(totalGrossUp)],
                    ['รายจ่ายรวม (บาท/ปี)', `-${fmt(expense)}`, `-${fmt(expense)}`, `-${fmt(expense)}`, 'neg'],
                    ['ดอกเบี้ยจ่าย (บาท/ปี)', `-${fmt(interest)}`, `-${fmt(interest)}`, `-${fmt(interest)}`, 'neg'],
                    ['กำไรก่อนภาษี (บาท/ปี)', fmt(pbt_before), fmt(pbt_afterPrem), fmt(pbt_afterPremGross)],
                    ['เสียภาษีนิติบุคคล (บาท/ปี)', `-${fmt(citBefore)}`, `-${fmt(citPrem)}`, `-${fmt(citGross)}`, 'neg'],
                    ['ภาษีลดลง (บาท/ปี)', '-', fmt(taxSavedPrem), fmt(taxSavedGross), 'hi'],
                    ['% ที่ลดลง', '-', pctSavedPrem !== undefined ? `${pctSavedPrem.toFixed(2)}%` : '-', pctSavedGross !== undefined ? `${pctSavedGross.toFixed(2)}%` : '-', 'hi'],
                    ['กำไร(ขาดทุน) สุทธิ (บาท/ปี)', fmt(netAfterBefore), fmt(netAfterPrem), fmt(netAfterGross), 'hi'],
                ].map((row, idx) => (_jsxs(View, { style: styles.tdrow, children: [_jsx(Text, { style: [styles.td, { flex: 1.4 }], children: row[0] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[1] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[2] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[3] === 'neg' || row[3] === 'hi' ? row[3] && row[0].includes('%') ? row[4] : row[3] : row[3] })] }, idx))), _jsx(Text, { style: styles.h2, children: "\u0E20.\u0E07.\u0E14.91 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23" }), ds.map((it, i) => {
                    const base = it.annualSalary ?? 0;
                    const prem = it.personalInsurancePremium ?? 0;
                    const g3 = progressiveGrossUp(base, prem, personalExpense + personalAllowance);
                    const tax1 = Math.max(0, base - personalExpense - personalAllowance);
                    const tax2 = Math.max(0, base + prem - personalExpense - personalAllowance);
                    const tax3 = Math.max(0, base + prem + g3 - personalExpense - personalAllowance);
                    const pit1 = pitTax(tax1);
                    const pit2 = pitTax(tax2);
                    const pit3 = pitTax(tax3);
                    const netY1 = base - pit1;
                    const netY2 = base - pit2;
                    const netY3 = base - pit3 + g3;
                    return (_jsxs(View, { style: { marginTop: 6 }, children: [_jsxs(Text, { style: styles.p, children: ["\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23: ", it.name || `ผู้บริหาร ${i + 1}`] }), _jsxs(View, { style: [styles.table, styles.thead], children: [_jsx(Text, { style: [styles.th, { flex: 1.4 }], children: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23 (\u0E20.\u0E07.\u0E14.91)" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E01\u0E48\u0E2D\u0E19\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22" }), _jsx(Text, { style: [styles.th, styles.tdRight], children: "\u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E41\u0E17\u0E19" })] }), [
                                ['เงินได้พึงประเมิน ม.40(1) (บาท/ปี)', fmt(base), fmt(base), fmt(base)],
                                ['ค่าเบี้ยประกันฯ (บาท/ปี)', fmt(0), fmt(prem), fmt(prem)],
                                ['ค่าภาษีออกแทนทุกทอด (บาท/ปี)', fmt(0), fmt(0), fmt(g3)],
                                ['หัก ค่าใช้จ่ายส่วนตัว (บาท/ปี)', `-${fmt(100000)}`, `-${fmt(100000)}`, `-${fmt(100000)}`, 'neg'],
                                ['หัก ค่าลดหย่อนส่วนตัว (บาท/ปี)', `-${fmt(160000)}`, `-${fmt(160000)}`, `-${fmt(160000)}`, 'neg'],
                                ['เงินได้สุทธิ (บาท/ปี)', fmt(tax1), fmt(tax2), fmt(tax3)],
                                ['ฐานภาษี (marginal)', `${(marginalRate(tax1) * 100).toFixed(0)}%`, `${(marginalRate(tax2) * 100).toFixed(0)}%`, `${(marginalRate(tax3) * 100).toFixed(0)}%`],
                                ['ภาษีบุคคลฯ (PIT) (บาท/ปี)', `-${fmt(pit1)}`, `-${fmt(pit2)}`, `-${fmt(pit3)}`, 'neg'],
                                ['เงินสุทธิกรรมการ (ปี) (บาท/ปี)', fmt(netY1), fmt(netY2), fmt(netY3), 'hi'],
                                ['เงินสุทธิกรรมการ (บาท/เดือน)', fmt((base - pit1) / 12), fmt((base - pit2) / 12), fmt((base - pit3 + g3) / 12), 'hi'],
                            ].map((row, idx) => (_jsxs(View, { style: styles.tdrow, children: [_jsx(Text, { style: [styles.td, { flex: 1.4 }], children: row[0] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[1] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[2] }), _jsx(Text, { style: [styles.td, styles.tdRight, row[3] === 'neg' ? styles.neg : (row[3] === 'hi' ? styles.hi : {})], children: row[3] === 'neg' || row[3] === 'hi' ? row[3] : row[3] })] }, idx)))] }, it.id));
                }), _jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D\u0E2A\u0E23\u0E23\u0E1E\u0E32\u0E01\u0E23\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07" }), RULINGS.slice(0, 2).map((r, i) => (_jsxs(Text, { style: styles.p, children: [i + 1, ". ", r.docNo, " \u2014 ", r.topic, " \u2014 ", r.summary, " (", r.url, ")"] }, r.docNo))), _jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E01\u0E33\u0E01\u0E31\u0E1A/Compliance" }), _jsx(Text, { style: styles.small, children: "\u0E01\u0E32\u0E23\u0E04\u0E33\u0E19\u0E27\u0E13\u0E43\u0E19\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E19\u0E35\u0E49\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E42\u0E14\u0E22\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19 (CIT 20% \u0E41\u0E25\u0E30 PIT \u0E41\u0E1A\u0E1A\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E01\u0E49\u0E32\u0E27\u0E2B\u0E19\u0E49\u0E32) \u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E04\u0E27\u0E23\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E01\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35/\u0E20\u0E32\u0E29\u0E35 \u0E41\u0E25\u0E30\u0E08\u0E31\u0E14\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19\u0E15\u0E32\u0E21\u0E2B\u0E25\u0E31\u0E01\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E01\u0E23\u0E21\u0E2A\u0E23\u0E23\u0E1E\u0E32\u0E01\u0E23" })] }) }));
}
