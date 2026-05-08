/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#0a0a0a',
          900: '#111111',
          800: '#1a1a1a',
          700: '#222222',
        },
        purple: {
          950: '#1a0a2e',
          900: '#2d1b69',
          700: '#5b21b6',
          600: '#7c3aed',
          500: '#8b5cf6',
          400: '#a855f7',
          300: '#c084fc',
        },
        gray: {
          800: '#374151',
          600: '#6b7280',
          500: '#9ca3af',
          400: '#d1d5db',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #7c3aed, 0 0 20px #7c3aed' },
          '100%': { textShadow: '0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 80px #7c3aed' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
