// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx,mdx}',
  ],
  safelist: [
    // ปุ่ม/ยูทิลิตีที่เราสร้างเอง
    'bp-btn','bp-btn--active','bp-btn-primary','bp-nav','bp-input','bp-focus-gold',
  ],
  theme: {
    extend: {
      colors: {
        // ผูกกับตัวแปรใน :root ของโปรเจกต์
        gold: 'var(--gold)',
        'gold-2': 'var(--gold-2)',

        // (เสริม เผื่ออยากใช้เป็นยูทิลิตี Tailwind ได้โดยไม่ต้องใช้ arbitrary)
        page: 'var(--page)',
        ink: 'var(--ink)',
        'ink-dim': 'var(--ink-dim)',
        'brand-accent': 'var(--brand-accent)',
      },
    },
  },
  plugins: [],
} satisfies Config
