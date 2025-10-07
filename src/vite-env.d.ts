/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // อื่น ๆ ที่อยากประกาศเพิ่ม
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
