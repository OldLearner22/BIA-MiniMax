/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // BIA Glass Dark Theme
        'bia-bg-start': '#0F172A',
        'bia-bg-end': '#1E293B',
        'bia-glass': 'rgba(30, 41, 59, 0.7)',
        'bia-glass-hover': 'rgba(51, 65, 85, 0.6)',
        'bia-glass-active': 'rgba(56, 189, 248, 0.15)',
        'bia-glass-input': 'rgba(15, 23, 42, 0.6)',
        'bia-border': 'rgba(255, 255, 255, 0.08)',
        'bia-border-focus': 'rgba(56, 189, 248, 0.5)',
        'bia-primary': '#38BDF8',
        'bia-secondary': '#818CF8',
        'bia-accent': '#C084FC',
        'bia-critical': '#F87171',
        'bia-warning': '#FBBF24',
        'bia-success': '#34D399',
        'bia-info': '#60A5FA',
        'bia-text-primary': '#F8FAFC',
        'bia-text-secondary': '#94A3B8',
        'bia-text-tertiary': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'bia-sm': '8px',
        'bia-md': '12px',
        'bia-lg': '16px',
        'bia-xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'lift': '0 10px 40px 0 rgba(0, 0, 0, 0.45)',
        'glow-primary': '0 0 15px rgba(56, 189, 248, 0.3)',
        'glow-critical': '0 0 15px rgba(248, 113, 113, 0.3)',
      },
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
