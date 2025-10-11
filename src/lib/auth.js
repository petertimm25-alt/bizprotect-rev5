import { jsx as _jsx } from "react/jsx-runtime";
// src/lib/auth.tsx
import React, { createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { hasFeature, getDirectorLimit, getPdfMonthlyQuota } from './roles';
import { registerDevice, touchDevice, subscribeDeviceRevocation } from './device';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
// ---------- Plan override helpers ----------
const OV_KEY = 'bp:plan';
const readPlanOverride = () => {
    if (typeof window === 'undefined')
        return null;
    const v = localStorage.getItem(OV_KEY);
    return v === 'free' || v === 'pro' || v === 'ultra' ? v : null;
};
const writePlanOverride = (p) => {
    try {
        if (p === 'pro' || p === 'ultra')
            localStorage.setItem(OV_KEY, p);
        else
            localStorage.removeItem(OV_KEY);
    }
    catch { }
};
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
    const [profilePlan, setProfilePlan] = React.useState(null);
    const envReady = !!supabase;
    const envError = envReady ? undefined : 'โปรดตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ในไฟล์ .env.local';
    const plan = React.useMemo(() => {
        const override = readPlanOverride();
        if (override)
            return override;
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
        let hb = null;
        let devSub = null;
        // listeners สำหรับ touch ตอนโฟกัส/กลับมาแอคทีฟ
        const onFocus = () => { void touchDevice().catch(() => { }); };
        const onVisible = () => { if (document.visibilityState === 'visible')
            void touchDevice().catch(() => { }); };
        async function boot() {
            if (!supabase) {
                setLoading(false);
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            setUser(mapUser(session?.user ?? null));
            setLoading(false);
            if (session?.user) {
                // sync plan
                void fetchProfilePlan(session.user.id).then(p => {
                    if (p) {
                        setProfilePlan(p);
                        writePlanOverride(p);
                    }
                    else {
                        writePlanOverride(null);
                    }
                });
                // ----- Device lifecycle -----
                await registerDevice(1);
                // heartbeat
                hb = setInterval(() => { void touchDevice().catch(() => { }); }, 60000);
                // focus / visibility
                window.addEventListener('focus', onFocus);
                document.addEventListener('visibilitychange', onVisible);
                // revoke
                devSub = subscribeDeviceRevocation(async () => {
                    try {
                        await supabase.auth.signOut();
                    }
                    finally {
                        location.reload();
                    }
                });
            }
            sub = supabase.auth.onAuthStateChange(async (_evt, sess) => {
                setUser(mapUser(sess?.user ?? null));
                setProfilePlan(null);
                // เคลียร์ของเดิมก่อน
                if (hb) {
                    clearInterval(hb);
                    hb = null;
                }
                window.removeEventListener('focus', onFocus);
                document.removeEventListener('visibilitychange', onVisible);
                devSub?.unsubscribe();
                devSub = null;
                if (!sess?.user) {
                    writePlanOverride(null);
                    return;
                }
                // ผู้ใช้ใหม่เข้ามา → sync plan + device lifecycle ใหม่
                void fetchProfilePlan(sess.user.id).then(p => {
                    if (p) {
                        setProfilePlan(p);
                        writePlanOverride(p);
                    }
                    else {
                        writePlanOverride(null);
                    }
                });
                await registerDevice(1);
                hb = setInterval(() => { void touchDevice().catch(() => { }); }, 60000);
                window.addEventListener('focus', onFocus);
                document.addEventListener('visibilitychange', onVisible);
                devSub = subscribeDeviceRevocation(async () => {
                    try {
                        await supabase.auth.signOut();
                    }
                    finally {
                        location.reload();
                    }
                });
            });
        }
        void boot();
        return () => {
            sub?.data?.subscription?.unsubscribe?.();
            if (hb)
                clearInterval(hb);
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
            devSub?.unsubscribe();
        };
    }, []);
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
        if (p) {
            setProfilePlan(p);
            writePlanOverride(p);
        }
        else {
            writePlanOverride(null);
        }
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
        writePlanOverride(null);
    };
    const value = {
        user, loading,
        envReady, envError,
        plan, ent,
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
