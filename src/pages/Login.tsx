import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"/>
    </svg>
  );
}

export default function Login() {
  const nav = useNavigate();
  const { signInWithEmail, envError } = useAuth();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setOk(null);
    const trimmed = email.trim();
    if (!trimmed) { setError("กรุณากรอกอีเมล"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError("รูปแบบอีเมลไม่ถูกต้อง"); return; }

    try {
      setLoading(true);
      await signInWithEmail(trimmed);
      setOk("ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว — โปรดตรวจสอบกล่องจดหมาย");
    } catch (err: any) {
      setError(err?.message || "ส่งลิงก์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-xl mx-auto px-6 md:px-8 py-10 md:py-14">
      {/* โลโก้ + แบรนด์ */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="public/brand/BizProtectLogo.png"
          alt="BizProtect"
          className="h-16 w-16 rounded-full border border-white/15 shadow mb-3"
        />
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--brand-accent)' }}>เข้าสู่ระบบ</h1>
        <p className="mt-1 text-white/70 text-sm">Keyman Corporate Policy Calculator</p>
      </div>

      {/* Card */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-white/10 bg-white/[.04] p-5 md:p-6"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), 0 8px 28px rgba(0,0,0,.25)"
        }}
        noValidate
      >
        <label className="block">
          <div className="mb-1 text-white/75">อีเมล</div>
          <input
            id="email"
            type="email"
            className="w-full h-11 md:h-12 rounded-xl px-3 bp-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        {envError && (
          <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-500/10 text-yellow-100 px-3 py-2 text-sm">
            {envError}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {ok && (
          <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 px-3 py-2 text-sm">
            {ok}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bp-btn-primary rounded-xl px-4 py-2 font-semibold inline-flex items-center justify-center gap-2"
          >
            {loading && <Spinner />}
            ส่งลิงก์เข้าสู่ระบบ
          </button>

          <Link
            to="/pricing"
            className="bp-btn rounded-xl px-4 py-2 text-center"
          >
            ดูแพ็กเกจ
          </Link>
        </div>

        <p className="mt-5 text-sm text-white/70">
          ยังไม่มีบัญชี?{" "}
          <Link to="/pricing" className="hover:opacity-90" style={{ color: 'var(--brand-accent)' }}>
            ดูแพ็กเกจและสมัครใช้งาน
          </Link>
        </p>
      </form>

      <p className="mt-4 text-center text-xs text-white/50">
        เข้าระบบนี้ถือว่ายอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวของ BizProtect
      </p>
    </section>
  );
}
