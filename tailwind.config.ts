// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,mdx}'
  ],
  safelist: [
    // ปุ่ม/ยูทิลิตีที่เราสร้างเอง
    'bp-btn','bp-btn--active','bp-btn-primary','bp-nav','bp-input','bp-focus-gold'
  ],
  theme: { extend: {} },
  plugins: []
} satisfies Config
