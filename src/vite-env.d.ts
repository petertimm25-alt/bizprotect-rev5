/// <reference types="vite/client" />

// ขยาย type ให้ import.meta.env รู้จักคีย์ที่เราใช้
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    readonly BASE_URL?: string; // เผื่อใช้ในบางไฟล์
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
