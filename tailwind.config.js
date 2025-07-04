/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'serif': ['Georgia', 'serif'],
      },
      colors: {
        vintage: {
          cream: '#F0EDE6',
          beige: '#D4C4A8',
          brown: '#3C2415',
          darkBrown: '#2A1810',
          accent: '#8B6F47',
        },
        brown: {
          50: '#f7f5f3',
          100: '#ede8e3',
          200: '#ddd4c8',
          300: '#c7b8a4',
          400: '#b09682',
          500: '#9d7f68',
          600: '#8B6F47',
          700: '#6B5538',
          800: '#3C2415',
          900: '#2A1810',
          950: '#1A100A',
        },
        cream: {
          50: '#fdfcfa',
          100: '#F0EDE6',
          200: '#D4C4A8',
          300: '#c4b196',
          400: '#b39d83',
          500: '#a08970',
          600: '#8d755d',
          700: '#6f5d4a',
          800: '#5a4c3c',
          900: '#4a3f32',
        },
        metallic: {
          beige: {
            50: '#faf9f7',
            100: '#f2f0ec',
            200: '#e8e4dc',
            300: '#ddd6c8',
            400: '#cfc4b0',
            500: '#bfb198',
            600: '#a89b7f',
            700: '#8d7d66',
            800: '#756753',
            900: '#615545',
          },
          gray: {
            50: '#f8f8f7',
            100: '#efeeec',
            200: '#e2e0dc',
            300: '#d1cdc6',
            400: '#bbb5ab',
            500: '#a59d90',
            600: '#918776',
            700: '#7a7062',
            800: '#665d52',
            900: '#554d44',
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.9s ease-out',
        'slide-in-right': 'slideInRight 0.9s ease-out',
        'bounce-gentle': 'bounceGentle 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-flow': 'gradientFlow 15s ease infinite',
        'wave-motion': 'waveMotion 20s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-60px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(60px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        waveMotion: {
          '0%': { 
            backgroundPosition: '0% 0%',
            transform: 'scale(1)'
          },
          '25%': { 
            backgroundPosition: '100% 100%',
            transform: 'scale(1.02)'
          },
          '50%': { 
            backgroundPosition: '100% 0%',
            transform: 'scale(1)'
          },
          '75%': { 
            backgroundPosition: '0% 100%',
            transform: 'scale(1.01)'
          },
          '100%': { 
            backgroundPosition: '0% 0%',
            transform: 'scale(1)'
          },
        }
      },
      backgroundImage: {
        'vintage-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232A1810' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'vintage-gradient': 'linear-gradient(135deg, #F0EDE6 0%, #D4C4A8 100%)',
        'brown-gradient': 'linear-gradient(135deg, #3C2415 0%, #2A1810 100%)',
        'dynamic-waves': 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8)',
        'metallic-flow': 'linear-gradient(45deg, #bfb198, #a59d90, #8d7d66, #7a7062)',
        'animated-bg': 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776)',
      },
      boxShadow: {
        'vintage': '0 8px 32px rgba(42, 24, 16, 0.15)',
        'vintage-lg': '0 20px 40px rgba(42, 24, 16, 0.2)',
        'metallic': '0 8px 32px rgba(139, 111, 71, 0.1)',
        'deep': '0 25px 50px rgba(26, 16, 10, 0.3)',
      }
    },
  },
  plugins: [],
};