import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-hind-siliguri)', 'system-ui', 'sans-serif'],
        hind: ['var(--font-hind-siliguri)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} as Config;
