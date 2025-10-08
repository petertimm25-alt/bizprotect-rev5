import { jsx as _jsx } from "react/jsx-runtime";
// src/lib/auth.tsx
import React, { createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { hasFeature, getDirectorLimit, getPdfMonthlyQuota } from './roles';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
// ===== Dev override for plan (Method A) =====
const readPlanOverride = () => {
    if (typeof window === 'undefined')
        return null;
    const v = localStorage.getItem('bp:plan');
    return v === 'free' || v === 'pro' || v === 'ultra' ? v : null;
};
// แปลง Supabase.User -> UserLite (คงพฤติกรรมเดิมไว้)
function mapUser(u) {
    if (!u)
        return null;
    const metaPlan = u.user_metadata?.plan;
    const plan = readPlanOverride() ?? metaPlan ?? 'free';
    return {
        id: u.id,
        email: u.email ?? null,
        name: u.user_metadata?.name ?? null,
        plan,
    };
}
const AuthCtx = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    // แผนจากตาราง profiles (ถ้ามี) — override meta/override
    const [profilePlan, setProfilePlan] = React.useState(null);
    const envReady = !!supabase;
    const envError = envReady ? undefined : 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local';
    // แผนสุดท้ายที่ใช้จริง: override -> profiles.plan -> user.metadata.plan -> 'free'
    const plan = React.useMemo(() => {
        const override = readPlanOverride();
        if (override)
            return override;
        if (profilePlan)
            return profilePlan;
        return (user?.plan ?? 'free');
    }, [user?.plan, profilePlan]);
    // รวมสิทธิ์จาก roles.ts (ไม่ต้องมี getEntitlement ใน roles)
    const ent = React.useMemo(() => ({
        directorsMax: getDirectorLimit(plan),
        pdfMonthlyQuota: getPdfMonthlyQuota(plan),
        export_pdf: hasFeature(plan, 'export_pdf'),
        no_watermark: hasFeature(plan, 'no_watermark'),
        agent_identity_on_pdf: hasFeature(plan, 'agent_identity_on_pdf'),
        knowledge_full: hasFeature(plan, 'knowledge_full'),
        custom_branding: hasFeature(plan, 'custom_branding'),
        proposal_builder: hasFeature(plan, 'proposal_builder'),
        priority_support: hasFeature(plan, 'priority_support'),
    }), [plan]);
    React.useEffect(() => {
        // ใช้ any เพื่อหลีกเลี่ยง TS แง่ type ของ onAuthStateChange ในกรณี supabase เป็น null
        let sub;
        async function boot() {
            if (!supabase) {
                setLoading(false);
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            setUser(mapUser(session?.user ?? null));
            setLoading(false);
            if (session?.user) {
                void fetchProfilePlan(session.user.id).then((p) => { if (p)
                    setProfilePlan(p); });
            }
            sub = supabase.auth.onAuthStateChange((_evt, sess) => {
                setUser(mapUser(sess?.user ?? null));
                setProfilePlan(null);
                if (sess?.user) {
                    void fetchProfilePlan(sess.user.id).then((p) => { if (p)
                        setProfilePlan(p); });
                }
            });
        }
        boot();
        return () => sub?.data?.subscription?.unsubscribe?.();
    }, []);
    // ดึง profiles.plan จากฐานข้อมูล (ถ้ามี)
    const fetchProfilePlan = async (uid) => {
        try {
            if (!supabase)
                return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', uid)
                .single();
            if (error || !data?.plan)
                return null;
            const p = data.plan;
            return p === 'free' || p === 'pro' || p === 'ultra' ? p : 'free';
        }
        catch {
            return null;
        }
    };
    const refreshProfile = async () => {
        if (!supabase || !user?.id)
            return;
        const p = await fetchProfilePlan(user.id);
        if (p)
            setProfilePlan(p);
    };
    const signInWithEmail = async (email) => {
        if (!supabase)
            throw new Error('Supabase not ready');
        localStorage.setItem('bp_pending_email', email);
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
        });
        if (error)
            throw error;
    };
    const signOut = async () => {
        if (!supabase)
            return;
        await supabase.auth.signOut();
        setUser(null);
        setProfilePlan(null);
    };
    const value = {
        user,
        loading,
        envReady, envError,
        plan,
        ent,
        signInWithEmail,
        signOut,
        logout: signOut,
        refreshProfile,
    };
    return _jsx(AuthCtx.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx)
        throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
