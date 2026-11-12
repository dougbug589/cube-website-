import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ═══ CUBE × ETIHAD Color System ═══
        slateRail: '#33454E',
        slateDeep: '#2B3B44',
        slatePanel: '#243239',
        slateCard: '#3A4C56',
        goldCore: '#C4921B',
        goldBright: '#E9B215',
        pearl: '#F5EFE4',
        sand: '#C9BCA6',
        sandDim: '#A89476',
        sandFaint: '#8A7F6D',
        // Legacy aliases (components referencing old names keep working)
        navy: {
          DEFAULT: '#2B3B44',
          950: '#243239',
          900: '#2B3B44',
          850: '#33454E',
          800: '#33454E',
          700: '#3A4C56',
          600: '#4A5F6A',
          50: '#F5EFE4',
        },
        gold: {
          DEFAULT: '#C4921B',
          600: '#B07F14',
          500: '#C4921B',
          400: '#E9B215',
          300: '#F0C468',
          200: '#F6DA86',
          100: '#F7EDD3',
          50: '#FBF6EA',
        },
        silver: {
          DEFAULT: '#C9BCA6',
          300: '#C9BCA6',
          400: '#A89476',
          500: '#8A7F6D',
        },
        'light-grey': '#F5EFE4',
        slate: {
          50: '#F5EFE4',
          100: '#E8E2D5',
          200: '#C9BCA6',
          300: '#A89476',
          400: '#8A7F6D',
          500: '#5A6B74',
          600: '#4A5F6A',
          700: '#3A4C56',
          800: '#33454E',
          900: '#2B3B44',
          950: '#243239',
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"],
        soft: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        'cube': '0 10px 30px -10px rgba(15, 25, 32, 0.5), 0 4px 6px -4px rgba(15, 25, 32, 0.35)',
        'cube-hover': '0 20px 40px -15px rgba(15, 25, 32, 0.6), 0 8px 16px -6px rgba(196, 146, 27, 0.25)',
        'cube-glow': '0 0 25px rgba(196, 146, 27, 0.4)',
        'cube-navy-glow': '0 0 25px rgba(43, 59, 68, 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'riseIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float-y': 'floatY 6s ease-in-out infinite',
        'gold-pulse': 'goldPulse 2.5s ease-out infinite',
        // Logo marquees: each track holds its list twice, so moving by -50%
        // loops seamlessly. Duration is set per track (inline style).
        marquee: 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee 60s linear infinite reverse',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196, 146, 27, 0.45)' },
          '50%': { boxShadow: '0 0 0 8px rgba(196, 146, 27, 0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
