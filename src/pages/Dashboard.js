import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Dashboard.tsx
import React from 'react';
import ExportPDF from '../components/ExportPDF';
import { load, save } from '../lib/storage';
import { initialState } from '../lib/state';
import { useDebounceEffect } from '../lib/useDebounceEffect';
import { progressiveGrossUp } from '../lib/tax';
import { useAuth } from '../lib/auth';
import StickySummary from './dashboard/StickySummary';
import CompanySection from './dashboard/CompanySection';
import DirectorsSection from './dashboard/DirectorsSection';
import CITTable from './dashboard/CITTable';
import PITSection from './dashboard/PITSection';
import ReturnSection from './dashboard/ReturnSection';
import PresenterSection from './dashboard/PresenterSection';
const EXPORT_ANCHOR_ID = 'export-anchor';
export default function Dashboard() {
    const [data, setData] = React.useState(() => load(initialState));
    useDebounceEffect(() => save(data), [data], 500);
    // ===== Entitlements =====
    const { user, ent } = useAuth();
    const canExport = !!user && ent.export_pdf;
    const limit = ent.directorsMax;
    const canEditPresenter = ent.agent_identity_on_pdf;
    const canUploadLogo = ent.custom_branding;
    // Trim directors if exceeds plan limit
    React.useEffect(() => {
        setData(s => {
            const ds = s.company.directors;
            if (ds.length > limit) {
                try {
                    alert(`แพ็กเกจปัจจุบันรองรับผู้บริหารสูงสุด ${limit} คน รายการส่วนเกินถูกตัดให้แล้ว`);
                }
                catch { }
                return { ...s, company: { ...s.company, directors: ds.slice(0, limit) } };
            }
            return s;
        });
    }, [limit]);
    // Ensure presenter defaults once
    React.useEffect(() => {
        setData(s => s.presenter
            ? s
            : {
                ...s,
                presenter: {
                    name: 'สมคิด',
                    phone: '08x-xxx-xxxx',
                    email: 'somkid@company.com',
                    company: '',
                    licenseNo: '',
                    logoDataUrl: undefined
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Default “แบบประกันฯ แนะนำ”
    React.useEffect(() => {
        setData(s => {
            const cur = s;
            if (cur.recProductName && cur.recPayYears && cur.recCoverage)
                return s;
            return {
                ...s,
                recProductName: cur.recProductName ?? 'My Style Legacy Ultra (Unit Linked)',
                recPayYears: cur.recPayYears ?? '7 ปี',
                recCoverage: cur.recCoverage ?? 'ถึงอายุ 99 ปี',
            };
        });
    }, []);
    // ------------- Shortcuts / derived -------------
    const c = data.company;
    const ds = c.directors;
    const income = c.companyIncome ?? 0;
    const expense = c.companyExpense ?? 0;
    const interest = c.interestExpense ?? 0;
    const actualCIT = c.actualCIT ?? 0;
    const currentThaiYear = new Date().getFullYear() + 543;
    const taxYear = c.taxYear;
    const personalExpense = 100000;
    const personalAllowance = 160000;
    const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0);
    const gus = ds.map(d => {
        const base = d.annualSalary ?? 0;
        const prem = d.personalInsurancePremium ?? 0;
        const g = progressiveGrossUp(base, prem, personalExpense + personalAllowance);
        return { g };
    });
    const totalGrossUp = gus.reduce((s, g) => s + g.g, 0);
    const CIT_RATE = 0.20;
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
    const trueTax_before = actualCIT;
    const trueTax_afterPrem = cit_afterPrem + (disallow_afterPrem * CIT_RATE);
    const trueTax_afterPremGross = cit_afterPremGross + (disallow_afterPremGross * CIT_RATE);
    const taxSaved_afterPremGross = Math.max(0, trueTax_before - trueTax_afterPremGross);
    const taxSavedPct_afterPremGross = trueTax_before > 0 ? (taxSaved_afterPremGross / trueTax_before) * 100 : 0;
    const combinedCost = totalPremium + totalGrossUp;
    const disallow_afterPrem_display = pbt_afterPrem < 0 ? 0 : disallow_afterPrem;
    const disallow_afterPremGross_display = pbt_afterPremGross < 0 ? 0 : disallow_afterPremGross;
    const handleLogoChange = (file) => {
        if (!file) {
            setData(s => ({ ...s, presenter: { ...s.presenter, logoDataUrl: undefined } }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            setData(s => ({ ...s, presenter: { ...s.presenter, logoDataUrl: dataUrl } }));
        };
        reader.readAsDataURL(file);
    };
    const setTaxYear = (v) => setData(s => ({ ...s, company: { ...s.company, taxYear: v } }));
    const handleCompanyChange = (patch) => setData(s => ({ ...s, company: { ...s.company, ...patch } }));
    const handleClearCompany = () => {
        setData(s => ({
            ...s,
            company: {
                ...s.company,
                name: '',
                companyIncome: 0,
                companyExpense: 0,
                interestExpense: 0,
                corporateTaxRate: 0.20,
                actualCIT: 0,
                taxYear: undefined,
                directors: []
            }
        }));
    };
    const recProductName = data.recProductName;
    const recPayYears = data.recPayYears;
    const recCoverage = data.recCoverage;
    const setRecFields = (p) => setData(s => ({ ...s, ...p }));
    // ปุ่มลัดกลับไปบนสุด (ไปที่ Export)
    const scrollToExport = () => {
        const el = document.getElementById(EXPORT_ANCHOR_ID);
        if (el)
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else
            window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (_jsxs("main", { className: "mx-auto max-w-6xl px-6 py-10 space-y-8", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [_jsx("h2", { className: "text-3xl font-semibold text-[#EBDCA6]", children: "Keyman Corporate Policy Calculator" }), _jsx("span", { id: EXPORT_ANCHOR_ID, className: "block h-0 scroll-mt-24", "aria-hidden": "true" }), _jsx("div", { className: "shrink-0", children: canExport ? (_jsx(ExportPDF, { state: data })) : (_jsx("button", { onClick: () => (window.location.href = '/pricing'), className: "inline-flex items-center gap-2 rounded-lg border border-gold/40 px-4 py-2 text-sm hover:bg-gold/10", title: "\u0E2D\u0E31\u0E1B\u0E40\u0E01\u0E23\u0E14\u0E40\u0E1B\u0E47\u0E19 Pro \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 Export PDF (\u0E44\u0E21\u0E48\u0E08\u0E33\u0E01\u0E31\u0E14)", children: "Upgrade to Export PDF" })) })] }), _jsx(StickySummary, { taxYear: taxYear, currentThaiYear: currentThaiYear, setTaxYear: setTaxYear, taxSaved_afterPremGross: taxSaved_afterPremGross, taxSavedPct_afterPremGross: taxSavedPct_afterPremGross, combinedCost: combinedCost }), _jsx(CompanySection, { company: c, interest: interest, actualCIT: actualCIT, disallow_base: disallow_base, onChange: handleCompanyChange, onClear: handleClearCompany }), _jsx(DirectorsSection, { directors: ds, limit: limit, setData: setData, personalExpense: personalExpense, personalAllowance: personalAllowance, recProductName: recProductName, recPayYears: recPayYears, recCoverage: recCoverage, setRecFields: setRecFields }), _jsx(CITTable, { taxYear: taxYear, income: income, totalPremium: totalPremium, totalGrossUp: totalGrossUp, expense: expense, interest: interest, pbt_before: pbt_before, pbt_afterPrem: pbt_afterPrem, pbt_afterPremGross: pbt_afterPremGross, cit_before: cit_before, cit_afterPrem: cit_afterPrem, cit_afterPremGross: cit_afterPremGross, disallow_base: disallow_base, disallow_afterPrem_display: disallow_afterPrem_display, disallow_afterPremGross_display: disallow_afterPremGross_display, trueTax_before: trueTax_before, CIT_RATE: CIT_RATE }), _jsx(PITSection, { directors: ds, personalExpense: personalExpense, personalAllowance: personalAllowance }), _jsx(ReturnSection, { directors: ds }), canEditPresenter && (_jsx(PresenterSection, { data: data, setData: setData, canUploadLogo: canUploadLogo, handleLogoChange: handleLogoChange })), _jsx("div", { className: "pt-2", children: _jsx("div", { className: "mt-4 flex justify-center", children: _jsx("button", { type: "button", onClick: scrollToExport, className: "bp-btn bp-btn-primary font-bold", title: "\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E14\u0E49\u0E32\u0E19\u0E1A\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E2A\u0E31\u0E48\u0E07 Export PDF", children: "\u2191 \u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E2A\u0E31\u0E48\u0E07 Export PDF" }) }) })] }));
}
