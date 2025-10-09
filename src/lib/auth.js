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
// ---------- Safe Dev Override ----------
const allowOverride = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const allowByHost = host === 'localhost' || host === '127.0.0.1';
    const allowByEnv = import.meta?.env?.VITE_ENABLE_PLAN_OVERRIDE === '1';
    return allowByHost || allowByEnv;
};
const readPlanOverride = () => {
    if (!allowOverride())
        return null;
    try {
        const v = localStorage.getItem('bp:plan');
        return v === 'free' || v === 'pro' || v === 'ultra' ? v : null;
    }
    catch {
        return null;
    }
};
// ---------- map User ----------
function mapUser(u) {
    if (!u)
        return null;
    const metaPlan = u.user_metadata?.plan;
    // ไม่มี override ใน prod; dev เท่านั้น
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
    const [profilePlan, setProfilePlan] = React.useState(null);
    const envReady = !!supabase;
    const envError = envReady ? undefined : 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local';
    // ล้าง override อัตโนมัติถ้าไม่อนุญาตให้ใช้
    React.useEffect(() => {
        if (!allowOverride()) {
            try {
                localStorage.removeItem('bp:plan');
            }
            catch { }
        }
    }, []);
    // ใช้ profiles.plan → user.meta.plan → 'free' (override ได้เฉพาะ dev)
    const plan = React.useMemo(() => {
        const ov = readPlanOverride();
        if (ov)
            return ov;
        if (profilePlan)
            return profilePlan;
        return user?.plan ?? 'free';
    }, [user?.plan, profilePlan]);
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
                void fetchProfilePlan(session.user.id).then(p => { if (p)
                    setProfilePlan(p); });
            }
            sub = supabase.auth.onAuthStateChange((_evt, sess) => {
                setUser(mapUser(sess?.user ?? null));
                setProfilePlan(null);
                if (sess?.user) {
                    void fetchProfilePlan(sess.user.id).then(p => { if (p)
                        setProfilePlan(p); });
                }
            });
        }
        boot();
        return () => sub?.data?.subscription?.unsubscribe?.();
    }, []);
    const fetchProfilePlan = async (uid) => {
        try {
            if (!supabase)
                return null;
            const { data, error } = await supabase.from('profiles').select('plan').eq('id', uid).single();
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
            email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true }
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
        user, loading, envReady, envError,
        plan, ent,
        signInWithEmail, signOut, logout: signOut, refreshProfile,
    };
    return _jsx(AuthCtx.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx)
        throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
}
