import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        surfaceElevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        accentSoft: 'rgb(var(--color-accent-soft) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(24, 19, 12, 0.08)',
        glow: '0 16px 40px rgba(241, 128, 48, 0.14)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(circle at top left, rgba(241, 128, 48, 0.18), transparent 30%), radial-gradient(circle at 80% 20%, rgba(223, 156, 115, 0.22), transparent 24%), linear-gradient(180deg, rgba(255, 248, 242, 1), rgba(248, 242, 234, 1))',
      },
    },
  },
  plugins: [],
} satisfies Config
