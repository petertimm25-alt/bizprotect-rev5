import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/components/ExportPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf, Link, BlobProvider, Image, } from '@react-pdf/renderer';
import { pitTax, marginalRate, progressiveGrossUp } from '../lib/tax';
import { RULINGS } from '../data/rulings';
import { useAuth } from '../lib/auth';
import { hasFeature } from '../lib/roles';
import { canExportNow, noteExport, getRemaining } from '../lib/exportQuota';
import { toast } from '../lib/toast';
/* -------------------- Safe asset resolver (กันพาธเพี้ยน) -------------------- */
function getBaseUrl() {
    // ใช้ค่าจาก Vite ถ้ามี
    try {
        const b = import.meta?.env?.BASE_URL ?? import.meta?.env?.BASE;
        if (typeof b === 'string' && b.length)
            return b.endsWith('/') ? b : b + '/';
    }
    catch { }
    // ลองอ่าน <base href="...">
    try {
        const href = document.querySelector('base')?.getAttribute('href') || '/';
        return href.endsWith('/') ? href : href + '/';
    }
    catch { }
    return '/';
}
function asset(path) {
    const base = getBaseUrl();
    return base + path.replace(/^\//, '');
}
const BASE = getBaseUrl();
/* -------------------- Assets / Fonts -------------------- */
const F_REG = asset('fonts/IBMPlexSansThaiLooped-Regular.ttf');
const F_SEMI = asset('fonts/IBMPlexSansThaiLooped-SemiBold.ttf');
const F_BOLD = asset('fonts/IBMPlexSansThaiLooped-Bold.ttf');
const BP_LOGO = asset('brand/BizProtectLogo.png');
try {
    Font.register({
        family: 'PlexThaiLooped',
        fonts: [
            { src: F_REG, fontWeight: 400 },
            { src: F_SEMI, fontWeight: 600 },
            { src: F_BOLD, fontWeight: 700 },
        ],
    });
}
catch (e) {
    console.warn('PDF font register failed:', e);
}
/* -------------------- Theme: Ivory Gold -------------------- */
const THEME = {
    pageBg: '#FFFBF0',
    ink: '#2A2A2A',
    inkDim: '#6B6B6B',
    gold: '#D4AF37',
    border: '#E8DCC2',
    tableHeaderBg: '#FFF4D6',
    chipBg: '#F6EFD8',
    watermarkOpacity: 0.09,
};
const border = { borderStyle: 'solid', borderColor: THEME.border };
const styles = StyleSheet.create({
    page: {
        padding: 25,
        fontFamily: 'PlexThaiLooped',
        fontSize: 9,
        color: THEME.ink,
        backgroundColor: THEME.pageBg,
    },
    content: { marginTop: 20 },
    afterBreakTopGap: { marginTop: 28 },
    h1: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: THEME.ink },
    h2: { fontSize: 10, fontWeight: 600, marginTop: 10, marginBottom: 4, color: THEME.ink },
    gold: { color: THEME.gold, fontWeight: 600 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    label: { color: THEME.inkDim },
    value: {},
    card: { ...border, borderWidth: 1, borderRadius: 6, padding: 8, marginBottom: 8, backgroundColor: '#FFFFFF' },
    table: {
        marginTop: 4,
        ...border,
        borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, borderBottomWidth: 1,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
    },
    tr: {
        flexDirection: 'row',
        ...border,
        borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 1,
    },
    noBottom: { borderBottomWidth: 0 },
    th: { flex: 1, padding: 4, fontWeight: 600, backgroundColor: THEME.tableHeaderBg, lineHeight: 1.25, color: THEME.ink },
    td: { flex: 1, padding: 4, lineHeight: 1.25, color: THEME.ink },
    right: { textAlign: 'right' },
    note: { fontSize: 9, color: THEME.inkDim, marginTop: 6, lineHeight: 1.3 },
    pageNum: {
        position: 'absolute', bottom: 12, left: 0, right: 0,
        textAlign: 'center', color: THEME.inkDim, fontSize: 9,
    },
    wmBox: { position: 'absolute', top: '28%', left: 0, right: 0, alignItems: 'center', opacity: THEME.watermarkOpacity },
    wmImg: { width: 380, height: 380, objectFit: 'contain' },
    brand: { position: 'absolute', top: 10, right: 19, width: 40, objectFit: 'contain', opacity: 0.95 },
    presenterRow: { flexDirection: 'row', gap: 8 },
    presenterCol: { flex: 1 },
    presenterKV: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
    presenterLabel: { color: THEME.inkDim, minWidth: 90 },
    presenterValue: { flex: 1, textAlign: 'left' },
    planBox: { ...border, borderWidth: 1, borderRadius: 6, padding: 8, backgroundColor: '#FFFFFF', marginTop: 6, marginBottom: 6 },
    planTitle: { fontSize: 10, fontWeight: 600, color: THEME.ink, marginBottom: 2 },
    planText: { fontSize: 9, color: THEME.gold, fontWeight: 600 },
});
/* -------------------- Utils -------------------- */
const fmt = (n) => n === undefined || Number.isNaN(n)
    ? '-'
    : n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function chunkRows(rows, sizeFirst, sizeNext) {
    if (rows.length <= sizeFirst)
        return [rows];
    const pages = [];
    pages.push(rows.slice(0, sizeFirst));
    let idx = sizeFirst;
    while (idx < rows.length) {
        pages.push(rows.slice(idx, idx + sizeNext));
        idx += sizeNext;
    }
    return pages;
}
/* -------------------- Calculations -------------------- */
function buildComputed(state) {
    const c = state.company;
    const ds = c.directors;
    const income = c.companyIncome ?? 0;
    const expense = c.companyExpense ?? 0;
    const interest = c.interestExpense ?? 0;
    const actualCIT = c.actualCIT ?? 0;
    const taxYear = c.taxYear;
    const CIT_RATE = 0.2;
    const personalExpense = 100000;
    const personalAllowance = 160000;
    const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0);
    const gus = ds.map(d => {
        const base = d.annualSalary ?? 0;
        const prem = d.personalInsurancePremium ?? 0;
        const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance);
        const taxable = Math.max(0, base + prem + g - (personalExpense + personalAllowance));
        const rate = marginalRate(taxable);
        const pit3 = pitTax(taxable);
        const pit1 = pitTax(Math.max(0, base - personalExpense - personalAllowance));
        const net1 = base - pit1;
        const net3 = base - pit3 + g;
        const sumAssured = d?.sumAssured ?? 0;
        const surrenderY7 = d?.surrenderY7;
        const surrenderAge60 = d?.surrenderAge60;
        const surrenderAge70 = d?.surrenderAge70;
        const surrenderAge99 = d?.surrenderAge99;
        return { id: d.id, name: d.name, base, prem, g, rate, pit1, net1, pit3, net3, sumAssured, surrenderY7, surrenderAge60, surrenderAge70, surrenderAge99 };
    });
    const totalGrossUp = gus.reduce((s, g) => s + g.g, 0);
    const pbt_before = income - expense - interest;
    const pbt_afterPrem = income - totalPremium - expense - interest;
    const pbt_afterPremGross = income - totalPremium - totalGrossUp - expense - interest;
    const cit_before = Math.max(0, pbt_before) * CIT_RATE;
    const cit_afterPrem = Math.max(0, pbt_afterPrem) * CIT_RATE;
    const cit_afterPremGross = Math.max(0, pbt_afterPremGross) * CIT_RATE;
    const disallow_tax_before = Math.max(0, actualCIT - cit_before);
    const disallow_base = disallow_tax_before / CIT_RATE;
    const disallow_afterPrem = Math.max(0, disallow_base - totalPremium);
    const disallow_afterPremGross = Math.max(0, disallow_base - totalPremium - totalGrossUp);
    const disallow_tax_afterPrem = disallow_afterPrem * CIT_RATE;
    const disallow_tax_afterPremGross = disallow_afterPremGross * CIT_RATE;
    const trueTax_before = actualCIT;
    const trueTax_afterPrem = cit_afterPrem + disallow_tax_afterPrem;
    const trueTax_afterPremGross = cit_afterPremGross + disallow_tax_afterPremGross;
    const taxSaved_afterPrem = Math.max(0, trueTax_before - trueTax_afterPrem);
    const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross);
    const taxSavedPct_afterPrem = trueTax_before > 0 ? (taxSaved_afterPrem / trueTax_before) * 100 : 0;
    const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0;
    const presenter = state?.presenter || { name: '', phone: '', email: '', company: '', licenseNo: '', logoDataUrl: undefined };
    return {
        c, ds, gus,
        income, expense, interest, actualCIT, taxYear,
        totalPremium, totalGrossUp, combinedCost: totalPremium + totalGrossUp,
        pbt_before, pbt_afterPrem, pbt_afterPremGross,
        cit_before, cit_afterPrem, cit_afterPremGross,
        disallow_base, disallow_afterPrem, disallow_afterPremGross,
        disallow_tax_before, disallow_tax_afterPrem, disallow_tax_afterPremGross,
        trueTax_before, trueTax_afterPrem, trueTax_afterPremGross,
        taxSaved_afterPrem, taxSaved_afterPremGross,
        taxSavedPct_afterPrem, taxSavedPct_afterPremGross,
        presenter,
    };
}
/* -------------------- Reusable Page Wrapper -------------------- */
function PageWithBrand({ children, showWatermark, brandLogo, }) {
    return (_jsxs(Page, { size: "A4", style: styles.page, children: [_jsx(View, { style: styles.content, children: children }), showWatermark && (_jsx(View, { style: styles.wmBox, fixed: true, children: _jsx(Image, { src: BP_LOGO, style: styles.wmImg }) })), _jsx(Text, { style: styles.pageNum, render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`, fixed: true }), brandLogo ? _jsx(Image, { src: brandLogo, style: styles.brand, fixed: true }) : null] }));
}
/* -------------------- PDF Doc -------------------- */
function ProposalPDF({ state, plan }) {
    const v = buildComputed(state);
    const showWatermark = plan === 'free';
    const brandLogo = plan === 'ultra' && v.presenter?.logoDataUrl ? v.presenter.logoDataUrl : undefined;
    const productName = 'My Style Legacy Ultra (Unit Linked)';
    const payYears = 7;
    const coverageAge = 99;
    const ROWS_FIRST_PAGE_A = 10;
    const ROWS_NEXT_PAGE_A = 18;
    const ROWS_FIRST_PAGE_B = 6;
    const ROWS_NEXT_PAGE_B = 18;
    const directorRows = v.gus.map(g => ({
        key: g.id,
        cells: [g.name || '-', fmt(g.base), fmt(g.pit1), fmt(g.pit3), fmt(g.g), fmt(g.net1), fmt(g.net3), fmt(g.sumAssured ?? 0)],
    }));
    const fundRows = v.gus.map(g => {
        const accum7 = g.prem ? g.prem * 7 : 0;
        return {
            key: g.id,
            cells: [
                g.name || '-',
                fmt(g.sumAssured ?? 0),
                fmt(g.prem ?? 0),
                fmt(accum7),
                fmt(g.surrenderY7),
                fmt(g.surrenderAge60),
                fmt(g.surrenderAge70),
                fmt(g.surrenderAge99),
            ],
        };
    });
    const HeaderRow = ({ headers }) => (_jsx(View, { style: styles.tr, children: headers.map((h, i) => (_jsx(Text, { style: [styles.th, i === 0 ? {} : styles.right], children: h }, i))) }));
    const BodyRows = ({ rows }) => (_jsx(_Fragment, { children: rows.map((r) => (_jsx(View, { style: styles.tr, children: r.cells.map((c, j) => (_jsx(Text, { style: [styles.td, j === 0 ? {} : styles.right], children: c }, j))) }, r.key))) }));
    return (_jsxs(Document, { children: [_jsxs(PageWithBrand, { showWatermark: showWatermark, brandLogo: brandLogo, children: [_jsxs(Text, { style: styles.h1, children: ["\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E01\u0E23\u0E21\u0E18\u0E23\u0E23\u0E21\u0E4C\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E19\u0E34\u0E15\u0E34\u0E1A\u0E38\u0E04\u0E04\u0E25 ", v.taxYear ? `• ปีภาษี ${v.taxYear}` : ''] }), _jsxs(View, { style: styles.card, children: [_jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17" }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E0A\u0E37\u0E48\u0E2D\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17" }), _jsx(Text, { style: styles.value, children: v.c.name || '-' })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E01\u0E33\u0E44\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E20\u0E32\u0E29\u0E35 (\u0E07\u0E1A\u0E08\u0E23\u0E34\u0E07))" }), _jsx(Text, { style: styles.value, children: fmt(v.pbt_before) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E20\u0E32\u0E29\u0E35 (\u0E07\u0E1A\u0E08\u0E23\u0E34\u0E07)" }), _jsx(Text, { style: styles.value, children: fmt(v.trueTax_before) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: [styles.label, { color: 'red' }], children: "\u0E04\u0E48\u0E32\u0E1A\u0E27\u0E01\u0E01\u0E25\u0E31\u0E1A (\u0E04\u0E32\u0E14\u0E04\u0E30\u0E40\u0E19\u0E08\u0E32\u0E01\u0E07\u0E1A\u0E08\u0E23\u0E34\u0E07)" }), _jsx(Text, { style: [styles.value, { color: 'red' }], children: fmt(v.disallow_base) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E01\u0E33\u0E44\u0E23\u0E01\u0E48\u0E2D\u0E19\u0E20\u0E32\u0E29\u0E35 (\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19))" }), _jsx(Text, { style: [styles.value, styles.gold], children: fmt(v.pbt_afterPremGross) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E20\u0E32\u0E29\u0E35 (\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19)" }), _jsx(Text, { style: [styles.value, styles.gold], children: fmt(v.trueTax_afterPremGross) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: [styles.label, { fontWeight: 700 }], children: "\u0E20\u0E32\u0E29\u0E35\u0E25\u0E14\u0E25\u0E07 (\u0E2B\u0E25\u0E31\u0E07\u0E40\u0E02\u0E49\u0E32\u0E23\u0E48\u0E27\u0E21\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E2F)" }), _jsxs(Text, { style: [styles.value, styles.gold], children: [fmt(v.taxSaved_afterPremGross), " (", v.taxSavedPct_afterPremGross.toFixed(2), "%)"] })] })] }), _jsxs(View, { style: styles.card, children: [_jsx(Text, { style: styles.h2, children: "\u0E23\u0E32\u0E22\u0E08\u0E48\u0E32\u0E22\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17 (\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2A\u0E19\u0E2D)" }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14" }), _jsx(Text, { style: styles.value, children: fmt(v.totalPremium) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: styles.label, children: "\u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14" }), _jsx(Text, { style: styles.value, children: fmt(v.totalGrossUp) })] }), _jsxs(View, { style: styles.row, children: [_jsx(Text, { style: [styles.label, { fontWeight: 700 }], children: "\u0E40\u0E1A\u0E35\u0E49\u0E22\u0E23\u0E27\u0E21 + \u0E20\u0E32\u0E29\u0E35\u0E2D\u0E2D\u0E01\u0E41\u0E17\u0E19\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14" }), _jsx(Text, { style: [styles.value, { fontWeight: 700 }], children: fmt(v.combinedCost) })] })] }), _jsx(Text, { style: styles.h2, children: "\u0E20.\u0E07.\u0E14.50 \u0E02\u0E2D\u0E07\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17\u0E2F" }), _jsxs(View, { style: styles.table, children: [_jsxs(View, { style: styles.tr, children: [_jsx(Text, { style: [styles.th, { flex: 2 }], children: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23" }), _jsx(Text, { style: [styles.th, styles.right], children: "\u0E01\u0E48\u0E2D\u0E19\u0E2F" }), _jsx(Text, { style: [styles.th, styles.right], children: "\u0E2B\u0E25\u0E31\u0E07\u0E2F: \u0E21\u0E35\u0E40\u0E1A\u0E35\u0E49\u0E22" }), _jsx(Text, { style: [styles.th, styles.right], children: "\u0E2B\u0E25\u0E31\u0E07\u0E2F: \u0E40\u0E1A\u0E35\u0E49\u0E22+\u0E20\u0E32\u0E29\u0E35\u0E2A\u0E38\u0E14\u0E17\u0E49\u0E32\u0E22" })] }), [
                                ['รายได้รวม (บาท/ปี)', v.income, v.income, v.income],
                                ['เบี้ยประกันฯกรมธรรม์นิติบุคคล (บาท/ปี)', 0, -v.totalPremium, -v.totalPremium],
                                ['ค่าภาษีออกแทนทุกทอด (ภ.ง.ด.50(1)) (บาท/ปี)', 0, 0, -v.totalGrossUp],
                                ['รายจ่ายรวม/ดอกเบี้ยจ่าย (บาท/ปี)', -(v.expense + v.interest), -(v.expense + v.interest), -(v.expense + v.interest)],
                                ['กำไรก่อนภาษี (บาท/ปี))', v.pbt_before, v.pbt_afterPrem, v.pbt_afterPremGross],
                                ['ภาษีเงินได้ที่เสียจริง (บาท/ปี)', -v.trueTax_before, -v.trueTax_afterPrem, -v.trueTax_afterPremGross],
                            ].map((r, i) => (_jsxs(View, { style: styles.tr, children: [_jsx(Text, { style: [styles.td, { flex: 2 }], children: r[0] }), _jsx(Text, { style: [styles.td, styles.right], children: fmt(r[1]) }), _jsx(Text, { style: [styles.td, styles.right], children: fmt(r[2]) }), _jsx(Text, { style: [styles.td, styles.right], children: fmt(r[3]) })] }, i))), _jsxs(View, { style: styles.tr, children: [_jsx(Text, { style: [styles.td, { flex: 2, fontWeight: 600, color: THEME.gold }], children: "\u0E20\u0E32\u0E29\u0E35\u0E17\u0E35\u0E48\u0E25\u0E14\u0E25\u0E07" }), _jsx(Text, { style: styles.td }), _jsx(Text, { style: [styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }], children: fmt(v.taxSaved_afterPrem) }), _jsx(Text, { style: [styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }], children: fmt(v.taxSaved_afterPremGross) })] }), _jsxs(View, { style: [styles.tr, styles.noBottom], children: [_jsx(Text, { style: [styles.td, { flex: 2, fontWeight: 600, color: THEME.gold }], children: "% \u0E17\u0E35\u0E48\u0E25\u0E14\u0E25\u0E07" }), _jsx(Text, { style: styles.td }), _jsx(Text, { style: [styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }], children: v.trueTax_before > 0 ? `${v.taxSavedPct_afterPrem.toFixed(2)}%` : '-' }), _jsx(Text, { style: [styles.td, styles.right, { color: THEME.gold, fontWeight: 600 }], children: v.trueTax_before > 0 ? `${v.taxSavedPct_afterPremGross.toFixed(2)}%` : '-' })] })] })] }), _jsxs(PageWithBrand, { showWatermark: showWatermark, brandLogo: brandLogo, children: [_jsx(Text, { style: styles.h2, children: "\u0E15\u0E32\u0E23\u0E32\u0E07\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23 (\u0E1C\u0E25\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E20\u0E32\u0E29\u0E35\u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25)" }), chunkRows(directorRows, 10, 18).map((rows, pageIdx) => (_jsxs(View, { style: pageIdx > 0 ? [styles.table, styles.afterBreakTopGap] : styles.table, break: pageIdx > 0, children: [_jsx(HeaderRow, { headers: ['ผู้บริหาร', 'เงินได้ ม.40(1)', 'PIT ก่อนฯ', 'PIT หลังฯ', 'ภาษีออกแทน', 'เงินสุทธิ ก่อนฯ', 'เงินสุทธิ หลังฯ', 'มีทุนประกันชีวิต'] }), rows.length === 0 ? (_jsx(View, { style: [styles.tr, styles.noBottom], children: _jsx(Text, { style: [styles.td, { flex: 8, textAlign: 'center', color: THEME.inkDim }], children: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23" }) })) : (_jsx(BodyRows, { rows: rows }))] }, `dir-page-${pageIdx}`))), _jsxs(View, { style: { marginTop: 10 }, children: [_jsx(Text, { style: styles.h2, children: "\u0E17\u0E38\u0E19\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2F & \u0E40\u0E1A\u0E35\u0E49\u0E22 \u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E23\u0E32\u0E22\u0E1A\u0E38\u0E04\u0E04\u0E25 \u2022 \u0E2A\u0E21\u0E21\u0E38\u0E15\u0E34\u0E1C\u0E25\u0E15\u0E2D\u0E1A\u0E41\u0E17\u0E19\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E25\u0E07\u0E17\u0E38\u0E19\u0E17\u0E35\u0E48 5%" }), _jsxs(View, { style: styles.planBox, children: [_jsx(Text, { style: styles.planTitle, children: "\u0E41\u0E1A\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E2F \u0E41\u0E19\u0E30\u0E19\u0E33 " }), _jsx(Text, { style: styles.planText, children: "My Style Legacy Ultra (Unit Linked)" }), _jsx(Text, { style: styles.planText, children: "\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E1A\u0E35\u0E49\u0E22 7 \u0E1B\u0E35" }), _jsx(Text, { style: styles.planText, children: "\u0E04\u0E38\u0E49\u0E21\u0E04\u0E23\u0E2D\u0E07\u0E16\u0E36\u0E07\u0E2D\u0E32\u0E22\u0E38 99 \u0E1B\u0E35" })] }), _jsx(Text, { style: styles.note, children: "** \u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E23\u0E31\u0E1A\u0E0B\u0E37\u0E49\u0E2D\u0E04\u0E37\u0E19\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E25\u0E07\u0E17\u0E38\u0E19\u0E43\u0E19\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E15\u0E48\u0E32\u0E07\u0E46" }), chunkRows(fundRows, fundRows.length >= 7 ? 6 : 6, 18).map((rows, pageIdx) => (_jsxs(View, { style: pageIdx > 0 ? [styles.table, styles.afterBreakTopGap] : styles.table, break: pageIdx > 0, wrap: false, children: [_jsx(HeaderRow, { headers: ['ผู้บริหาร', 'ทุนประกันชีวิต', 'เบี้ย/ปี', 'เบี้ยสะสม ปีที่ 7', '**กรมฯ ปีที่ 7', '**อายุ 60 ปี', '**อายุ 70 ปี', '**อายุ 99 ปี'] }), _jsx(BodyRows, { rows: rows })] }, `fund-page-${pageIdx}`))), _jsx(Text, { style: styles.note, children: "* \u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E02\u0E49\u0E32\u0E07\u0E15\u0E49\u0E19\u0E04\u0E33\u0E19\u0E27\u0E13\u0E08\u0E32\u0E01\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E1C\u0E25\u0E15\u0E2D\u0E1A\u0E41\u0E17\u0E19\u0E2A\u0E21\u0E21\u0E15\u0E34\u0E42\u0E14\u0E22\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22\u0E15\u0E48\u0E2D\u0E1B\u0E35 5% \u0E08\u0E32\u0E01 \u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E48\u0E19 AZD" })] }), _jsxs(View, { style: [styles.card, { marginTop: 15 }], wrap: false, children: [_jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E2B\u0E32\u0E23\u0E37\u0E2D\u0E2A\u0E23\u0E23\u0E1E\u0E32\u0E01\u0E23\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07" }), RULINGS.slice(0, 2).map((r, i) => (_jsxs(View, { style: { marginBottom: 3 }, children: [_jsxs(Text, { style: { fontWeight: 600 }, children: [i + 1, ". ", _jsx(Link, { src: r.url, children: r.docNo })] }), _jsxs(Text, { children: ["\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07: ", r.topic] }), _jsxs(Text, { style: { color: THEME.inkDim, fontSize: 9 }, children: ["\u0E41\u0E19\u0E27\u0E27\u0E34\u0E19\u0E34\u0E08\u0E09\u0E31\u0E22: ", r.summary] })] }, r.docNo)))] }), _jsxs(View, { style: styles.card, wrap: false, children: [_jsx(Text, { style: styles.h2, children: "\u0E02\u0E49\u0E2D\u0E01\u0E33\u0E01\u0E31\u0E1A / Compliance" }), _jsx(Text, { style: styles.note, children: "\u0E23\u0E30\u0E1A\u0E1A\u0E19\u0E35\u0E49\u0E43\u0E0A\u0E49\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E20\u0E32\u0E29\u0E35\u0E15\u0E32\u0E21\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22: \u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E19\u0E34\u0E15\u0E34\u0E1A\u0E38\u0E04\u0E04\u0E25 20% \u0E41\u0E25\u0E30\u0E20\u0E32\u0E29\u0E35\u0E40\u0E07\u0E34\u0E19\u0E44\u0E14\u0E49\u0E1A\u0E38\u0E04\u0E04\u0E25\u0E18\u0E23\u0E23\u0E21\u0E14\u0E32\u0E41\u0E1A\u0E1A\u0E01\u0E49\u0E32\u0E27\u0E2B\u0E19\u0E49\u0E32 \u0E42\u0E14\u0E22\u0E21\u0E35\u0E01\u0E32\u0E23\u0E1B\u0E31\u0E14\u0E40\u0E28\u0E29\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E21\u0E43\u0E19\u0E01\u0E32\u0E23\u0E19\u0E33\u0E40\u0E2A\u0E19\u0E2D\u0E2D" }), _jsx(Text, { style: styles.note, children: "\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E48\u0E32\u0E22 \u0E40\u0E0A\u0E48\u0E19 \u0E40\u0E1A\u0E35\u0E49\u0E22\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E0A\u0E35\u0E27\u0E34\u0E15\u0E01\u0E23\u0E23\u0E21\u0E01\u0E32\u0E23 \u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E2D\u0E2D\u0E01\u0E20\u0E32\u0E29\u0E35\u0E41\u0E17\u0E19 (gross-up) \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19\u0E41\u0E25\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1B\u0E15\u0E32\u0E21\u0E2B\u0E25\u0E31\u0E01\u0E40\u0E01\u0E13\u0E11\u0E4C\u0E02\u0E2D\u0E07\u0E01\u0E23\u0E21\u0E2A\u0E23\u0E23\u0E1E\u0E32\u0E01\u0E23" }), _jsxs(Text, { style: styles.note, children: [_jsx(Text, { style: { fontWeight: 600 }, children: "\u0E02\u0E49\u0E2D\u0E08\u0E33\u0E01\u0E31\u0E14\u0E04\u0E27\u0E32\u0E21\u0E23\u0E31\u0E1A\u0E1C\u0E34\u0E14:" }), " \u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13\u0E01\u0E32\u0E23\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33\u0E17\u0E32\u0E07\u0E01\u0E0E\u0E2B\u0E21\u0E32\u0E22/\u0E20\u0E32\u0E29\u0E35 \u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E04\u0E27\u0E23\u0E1B\u0E23\u0E36\u0E01\u0E29\u0E32\u0E1C\u0E39\u0E49\u0E40\u0E0A\u0E35\u0E48\u0E22\u0E27\u0E0A\u0E32\u0E0D\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08\u0E43\u0E08"] })] }), hasFeature(plan, 'agent_identity_on_pdf') && (_jsxs(View, { style: [styles.card, styles.afterBreakTopGap], wrap: false, break: true, children: [_jsx(Text, { style: styles.h2, children: "\u0E1C\u0E39\u0E49\u0E40\u0E2A\u0E19\u0E2D" }), _jsxs(View, { style: styles.presenterRow, children: [_jsxs(View, { style: styles.presenterCol, children: [_jsxs(View, { style: styles.presenterKV, children: [_jsx(Text, { style: styles.presenterLabel, children: "\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E40\u0E2A\u0E19\u0E2D" }), _jsx(Text, { style: styles.presenterValue, children: v.presenter?.name || '-' })] }), _jsxs(View, { style: styles.presenterKV, children: [_jsx(Text, { style: styles.presenterLabel, children: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23" }), _jsx(Text, { style: styles.presenterValue, children: v.presenter?.phone || '-' })] }), _jsxs(View, { style: styles.presenterKV, children: [_jsx(Text, { style: styles.presenterLabel, children: "\u0E2D\u0E35\u0E40\u0E21\u0E25" }), _jsx(Text, { style: styles.presenterValue, children: v.presenter?.email || '-' })] })] }), _jsxs(View, { style: styles.presenterCol, children: [_jsxs(View, { style: styles.presenterKV, children: [_jsx(Text, { style: styles.presenterLabel, children: "\u0E1A\u0E23\u0E34\u0E29\u0E31\u0E17" }), _jsx(Text, { style: styles.presenterValue, children: v.presenter?.company || '-' })] }), _jsxs(View, { style: styles.presenterKV, children: [_jsx(Text, { style: styles.presenterLabel, children: "\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15" }), _jsx(Text, { style: styles.presenterValue, children: v.presenter?.licenseNo || '-' })] })] })] })] }))] })] }));
}
/* -------------------- UI: ปุ่ม + พรีวิว -------------------- */
export default function ExportPDF({ state }) {
    const [open, setOpen] = React.useState(false);
    const { user } = useAuth();
    const plan = (user?.plan ?? 'free');
    const userId = user?.id ?? 'guest';
    const remaining = getRemaining(userId, plan);
    const downloadNow = async () => {
        if (!user) {
            toast('กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดเอกสาร');
            return;
        }
        const { ok, remaining } = canExportNow(user.id, plan);
        if (!ok) {
            toast('ถึงโควตา Export ประจำเดือนแล้ว • อัปเกรดแผนหรือรอเดือนถัดไป');
            window.location.href = '/pricing';
            return;
        }
        const blob = await pdf(_jsx(ProposalPDF, { state: state, plan: plan })).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BizProtect-Proposal.pdf';
        a.click();
        URL.revokeObjectURL(url);
        noteExport(user.id, plan);
        toast(remaining === null ? 'ดาวน์โหลดแล้ว (ไม่จำกัดโควตา)' : `ดาวน์โหลดแล้ว • เหลือ ${Math.max(0, (remaining ?? 0) - 1)} ครั้งในเดือนนี้`);
    };
    return (_jsxs(_Fragment, { children: [_jsxs("button", { onClick: () => setOpen(true), className: "rounded-xl px-4 py-2 md:h-12 bg-[var(--brand-accent)] text-[#0B1B2B] font-semibold hover:brightness-95", title: "\u0E14\u0E39\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E41\u0E25\u0E49\u0E27\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14", children: ["Export PDF", remaining === null ? (_jsx("span", { className: "ml-1 text-xs text-gold/80", children: "(\u0E44\u0E21\u0E48\u0E08\u0E33\u0E01\u0E31\u0E14)" })) : (_jsxs("span", { className: "ml-1 text-xs text-gold/80", children: ["(", remaining, " \u0E04\u0E23\u0E31\u0E49\u0E07/\u0E40\u0E14\u0E37\u0E2D\u0E19)"] }))] }), open && (_jsx("div", { className: "fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4", children: _jsxs("div", { className: "w-full max-w-5xl rounded-xl bg-[color:var(--page)] ring-1 ring-white/10 overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2 border-b border-white/10", children: [_jsx("div", { className: "text-sm text-[color:var(--ink-dim)]", children: "\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 (Preview)" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: downloadNow, className: "text-xs px-3 py-1 rounded ring-1 ring-gold/50 hover:bg-gold/10", children: "\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14" }), _jsx("button", { onClick: () => setOpen(false), className: "text-xs px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10", children: "\u0E1B\u0E34\u0E14" })] })] }), _jsx("div", { className: "h-[80vh] bg-black/10", children: _jsx(BlobProvider, { document: _jsx(ProposalPDF, { state: state, plan: plan }), children: ({ url, loading, error }) => {
                                    if (loading)
                                        return _jsx("div", { className: "p-6 text-center text-sm", children: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u2026" });
                                    if (error) {
                                        console.error('PDF preview error:', error);
                                        return _jsx("div", { className: "p-6 text-center text-sm text-red-400", children: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E44\u0E21\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08" });
                                    }
                                    return _jsx("iframe", { src: url || undefined, className: "w-full h-full", title: "PDF Preview" });
                                } }) })] }) }))] }));
}
