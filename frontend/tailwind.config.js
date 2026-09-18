/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Enable class-based dark mode (controlled by ThemeContext adding .dark to <html>)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002395',
          hover: '#001B73',
          light: '#E8ECF7',
        },
        background: '#F7F9FE',
        surface: {
          DEFAULT: '#F7F9FE',
          lowest: '#FFFFFF',
          low: '#F1F4F9',
          container: '#ECEEF3',
          high: '#E6E8ED',
          highest: '#E0E2E7',
          dim: '#D8DADF',
        },
        'on-surface': '#181C20',
        'on-surface-variant': '#424754',
        'text-secondary': '#52627A',
        'text-muted': '#8290A7',
        outline: '#727785',
        'outline-variant': '#C2C6D6',
        'border-base': '#E6EBF4',
        success: {
          DEFAULT: '#43B982',
          bg: '#EAF8F2',
        },
        warning: {
          DEFAULT: '#F5A34A',
          bg: '#FFF3E0',
        },
        error: {
          DEFAULT: '#E74F3D',
          bg: '#FCE8E8',
        },
        tertiary: '#4C5C7D',
        // Admin-specific accent (deep teal/slate)
        admin: {
          DEFAULT: '#1E3A5F',
          hover: '#162D4A',
          light: '#E8EEF6',
          accent: '#2E6DA4',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'page-title': ['32px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '1.6' }],
        'body-md': ['15px', { lineHeight: '1.6' }],
        'body-sm': ['13px', { lineHeight: '1.5' }],
        'label-caps': ['11px', { lineHeight: '1', letterSpacing: '0.06em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '2px',
        md: '4px',
        lg: '6px',
        xl: '8px',
        '2xl': '10px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.10)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        card: '0 12px 35px rgba(50, 88, 150, 0.08)',
        nav: '0 2px 10px rgba(50, 88, 150, 0.05)',
        'card-hover': '0 16px 40px rgba(50, 88, 150, 0.13)',
        // Dark mode shadows
        'dark-card': '0 12px 35px rgba(0, 0, 0, 0.35)',
        'dark-nav': '0 2px 10px rgba(0, 0, 0, 0.3)',
        'dark-card-hover': '0 16px 40px rgba(0, 0, 0, 0.5)',
      },
      spacing: {
        micro: '4px',
        xs: '6px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
        xxxl: '64px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'heartbeat': 'heartbeat 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
