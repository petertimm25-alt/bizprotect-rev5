export const PLAN_LABELS = {
    legacy: 'สวัสดิการเพื่อส่งมอบมรดก',
    wealth: 'สวัสดิการเพื่อความมั่งคั่งหลังเกษียณ',
    health_retire: 'สวัสดิการเพื่อกองทุนสุขภาพหลังเกษียณ',
};
// ระบบเลือก “แบบประกันฯ” ให้ตามแผน (static)
export const PLAN_DEF = {
    legacy: { productName: 'My Style Legacy Ultra (Unitlinked)', payLabel: 'ชำระเบี้ย 7 ปี' },
    wealth: { productName: 'My Style Wealth Ultra (Unitlinked)', payLabel: 'ชำระเบี้ย 7 ปี' },
    health_retire: { productName: 'My Style Legacy Ultra (Unitlinked) + (แผนสุขภาพ)', payLabel: 'ชำระเบี้ย 7 ปี' },
};
// ฟังก์ชัน mock “ตารางผลประโยชน์ย่อ” 3 จุด (ปี 1, ปีชำระสุดท้าย, อายุเป้าหมาย/สิ้นสุด)
export function buildMockBenefits({ sumAssured, yearlyPremium, payYears, targetAge, assumption, }) {
    // ตัวคูณ mock ง่าย ๆ ตามสมมติฐาน
    const growth = assumption === -1 ? 0.92
        : assumption === 2 ? 1.05
            : 1.25;
    // ปีตัวอย่าง
    const rows = [
        { label: `ปีที่ 1`, year: 1 },
        { label: `ปีที่ ${payYears}`, year: payYears },
        { label: `อายุ ${targetAge} ปี`, year: targetAge }, // ใช้เป็น marker เฉย ๆ
    ];
    return rows.map((r, idx) => {
        const paidYears = Math.min(r.year, payYears);
        const paidAccum = yearlyPremium * paidYears;
        const cashValue = Math.round(paidAccum * (0.85 + (idx + 1) * 0.15) * growth); // mock curve step
        const deathBenefit = Math.max(sumAssured, Math.round(cashValue * 1.2));
        return {
            point: r.label,
            paidYearly: yearlyPremium,
            paidAccum,
            cashValue,
            deathBenefit,
        };
    });
}
