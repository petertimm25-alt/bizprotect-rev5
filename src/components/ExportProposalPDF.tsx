// src/components/ExportProposalPDF.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { AppState } from "../lib/types";

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

function fmt(n?: number) {
  if (n === undefined || Number.isNaN(n)) return "-";
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function compute(state: AppState) {
  const c = state.company;
  const ds = c.directors;

  const income = c.companyIncome ?? 0;
  const expense = c.companyExpense ?? 0;
  const interest = (c as any).interestExpense ?? 0;
  const actualCIT = (c as any).actualCIT ?? 0;

  const personalExpense = 100000;
  const personalAllowance = 160000;

  const totalPremium = ds.reduce((s, d) => s + (d.personalInsurancePremium ?? 0), 0);

  // gross-up per director
  const progressiveGrossUp = (base: number, prem: number, deduction: number) => {
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
  const marginalRate = (taxable: number, b: number[][]) => {
    let left = taxable;
    let acc = 0;
    for (const [width, rate] of b) {
      const take = Math.max(0, Math.min(left, width));
      acc += take * rate;
      left -= take;
      if (left <= 0) return rate;
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

function ProposalDoc({ state }: { state: AppState }) {
  const T = compute(state);
  const taxYear = (state.company as any).taxYear || new Date().getFullYear() + 543;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>BizProtect — Executive Tax Proposal</Text>
        <View style={styles.row}>
          <Text style={styles.label}>บริษัท:</Text>
          <Text style={styles.strong}>{T.c.name || "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ปีภาษีอ้างอิง:</Text>
          <Text style={styles.strong}>{taxYear}</Text>
        </View>

        <Text style={styles.h2}>Executive Summary</Text>
        <View style={styles.row}><Text>กำไรก่อนภาษี</Text><Text>{fmt(T.pbt_before)}</Text></View>
        <View style={styles.row}><Text>กำไรก่อนภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</Text><Text>{fmt(T.pbt_afterPremGross)}</Text></View>
        <View style={styles.row}><Text>ภาษีงบจริง</Text><Text>{fmt(T.trueTax_before)}</Text></View>
        <View style={styles.row}><Text>ภาษี (หลังฯ: เบี้ย + ภาษีออกแทน)</Text><Text>{fmt(T.trueTax_afterPremGross)}</Text></View>
        <View style={styles.row}><Text>ภาษีลดลง (หลังฯ: เบี้ย + ภาษีออกแทน)</Text><Text>{fmt(T.taxSaved_afterPremGross)} ({T.taxSavedPct_afterPremGross.toFixed(2)}%)</Text></View>

        <Text style={styles.h2}>ค่าใช้จ่ายโครงการ (ปี)</Text>
        <View style={styles.row}><Text>รวมเบี้ยประกัน</Text><Text>{fmt(T.totalPremium)}</Text></View>
        <View style={styles.row}><Text>ภาษีออกแทนทุกทอด (รวม)</Text><Text>{fmt(T.totalGrossUp)}</Text></View>
        <View style={styles.row}><Text>รวมเบี้ย + ภาษีออกแทน</Text><Text>{fmt(T.totalPremium + T.totalGrossUp)}</Text></View>
      </Page>
    </Document>
  );
}

export default function ExportProposalPDF({
  state,
  fileName = "BizProtect-Proposal.pdf",
  compact = false,
}: {
  state: AppState;
  fileName?: string;
  compact?: boolean;
}) {
  const makeBlob = async () => {
    const blob = await pdf(<ProposalDoc state={state} />).toBlob();
    return blob;
  };

  const handlePreview = async () => {
    try {
      const blob = await makeBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
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
    } catch {
      alert("สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className={compact ? "" : "flex items-center gap-2"}>
      <button onClick={handlePreview} className="px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">
        พรีวิว Proposal
      </button>
      {!compact && (
        <button onClick={handleDownload} className="px-3 py-1 rounded ring-1 ring-white/20 hover:bg-white/10">
          ดาวน์โหลด PDF
        </button>
      )}
    </div>
  );
}
