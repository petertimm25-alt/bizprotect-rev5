export const PLAN_FEATURES = {
    // Free: ใช้ Export ได้ 3 ครั้ง/เดือน และมีลายน้ำ
    free: [
        'export_pdf',
        'autosave',
        'director_limit_1',
        // ไม่มี 'no_watermark'
        // ไม่มี agent identity/knowledge/proposal
    ],
    // Pro: ไม่มีลายน้ำ, โควตา 30 ครั้ง/เดือน, เพิ่มข้อมูลผู้เสนอในเอกสาร
    pro: [
        'export_pdf',
        'no_watermark',
        'agent_identity_on_pdf',
        'knowledge_full',
        'autosave',
        'director_limit_3',
    ],
    // Ultra: ไม่จำกัด, ไม่มีลายน้ำ, feature เต็ม
    ultra: [
        'export_pdf',
        'no_watermark',
        'agent_identity_on_pdf',
        'knowledge_full',
        'autosave',
        'custom_branding',
        'proposal_builder',
        'priority_support',
        'director_limit_10',
    ],
};
export function hasFeature(plan, feature) {
    return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}
export function isUltra(plan) {
    return plan === 'ultra';
}
export function isProOrUltra(plan) {
    return plan === 'pro' || plan === 'ultra';
}
// จำกัดจำนวนผู้บริหารตามแผน
export function getDirectorLimit(plan) {
    if (!plan)
        return 1;
    if (hasFeature(plan, 'director_limit_10'))
        return 10;
    if (hasFeature(plan, 'director_limit_3'))
        return 3;
    return 1;
}
export function getPdfMonthlyQuota(plan) {
    switch (plan) {
        case 'free':
            return 3;
        case 'pro':
            return 30;
        case 'ultra':
            return 'unlimited';
        default:
            return 0;
    }
}
