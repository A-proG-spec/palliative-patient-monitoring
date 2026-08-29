/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Imperial Blue
        primary: {
          DEFAULT: '#002395',
          hover: '#001B73',
          light: '#E8ECF7',
          container: '#002395',
        },
        'on-primary': '#FFFFFF',
        // Neutral Colors
        background: '#F7F9FE',
        surface: {
          DEFAULT: '#F7F9FE',
          'container-lowest': '#FFFFFF',
          'container-low': '#F1F4F9',
          container: '#ECEEF3',
          'container-high': '#E6E8ED',
          'container-highest': '#E0E2E7',
          dim: '#D8DADF',
        },
        // Text Colors
        foreground: '#181C20',
        'on-surface': '#181C20',
        'on-surface-variant': '#424754',
        'text-secondary': '#52627A',
        'text-muted': '#8290A7',
        // Outline & Border
        outline: {
          DEFAULT: '#727785',
          variant: '#C2C6D6',
        },
        'border-base': '#E6EBF4',
        // Status Colors
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
        destructive: '#E74F3D',
        // Secondary & Tertiary
        secondary: {
          DEFAULT: '#DCE3ED',
          fixed: '#DCE3ED',
          'fixed-dim': '#C0C7D1',
        },
        'on-secondary-fixed-variant': '#40474F',
        tertiary: '#4C5C7D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'page-title': ['32px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['28px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'label-caps': ['11px', { lineHeight: '1', letterSpacing: '0.06em', fontWeight: '600' }],
        'data-kpi': ['17px', { lineHeight: '1', letterSpacing: '0', fontWeight: '700' }],
      },
      spacing: {
        'micro': '4px',
        'xs': '6px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '48px',
        'section': '64px',
      },
      borderRadius: {
        none: '0',
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
        'glass-panel': '0 12px 35px rgba(50, 88, 150, 0.08)',
      },
      maxWidth: {
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1320px',
      },
    },
  },
  plugins: [],
};
