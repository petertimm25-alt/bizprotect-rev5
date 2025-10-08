// src/data/recommendedPlans.ts
/**
 * คืนค่าทุน/เบี้ยแนะนำอ้างอิงอายุ & เพศ (ค่าคงที่นำร่อง)
 * ในอนาคตคุณสามารถดึงจาก API หรือคำนวณจาก state ได้
 */
export function getRecommendedForAge(age = 35) {
    // ตัวอย่าง baseline (คุณปรับสูตรหรือค่าตาม “แผน …” ได้เลย)
    const labelM = `ชาย (${age} ปี)`;
    const labelF = `หญิง (${age} ปี)`;
    const savingsBase = 2000000;
    const savingsPremM = 60000;
    const savingsPremF = 55000;
    const healthBase = 1000000;
    const healthPremM = 25000;
    const healthPremF = 23000;
    return {
        savings: [
            { label: labelM, sumAssured: savingsBase, annualPremium: savingsPremM },
            { label: labelF, sumAssured: savingsBase, annualPremium: savingsPremF },
        ],
        health: [
            { label: labelM, sumAssured: healthBase, annualPremium: healthPremM },
            { label: labelF, sumAssured: healthBase, annualPremium: healthPremF },
        ],
    };
}
