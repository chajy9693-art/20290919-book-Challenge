import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A1230',
        card: '#111B42',
        'card-accent': '#16224F',
        border: '#26356F',
        text: '#F2F5FF',
        'text-muted': '#A3AEDB',
        accent: '#FFE600',
        'accent-fg': '#0A1230',
        success: '#34D399',
        error: '#F87171',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      maxWidth: {
        content: '720px',
      },
    },
  },
  plugins: [],
} satisfies Config
