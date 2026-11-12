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
        pearl: '#F2F5F6',
        sand: '#B9C5CA',
        sandDim: '#8C9AA0',
        sandFaint: '#7A888E',
        glow: '#7FD1C8',
        // Legacy aliases (components referencing old names keep working)
        navy: {
          DEFAULT: '#2B3B44',
          950: '#243239',
          900: '#2B3B44',
          850: '#33454E',
          800: '#33454E',
          700: '#3A4C56',
          600: '#4A5F6A',
          50: '#F2F5F6',
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
          DEFAULT: '#B9C5CA',
          300: '#B9C5CA',
          400: '#8C9AA0',
          500: '#7A888E',
        },
        'light-grey': '#F2F5F6',
        slate: {
          50: '#F2F5F6',
          100: '#E6ECEF',
          200: '#B9C5CA',
          300: '#8C9AA0',
          400: '#7A888E',
          500: '#5A6B74',
          600: '#4A5F6A',
          700: '#3A4C56',
          800: '#33454E',
          900: '#2B3B44',
          950: '#243239',
        }
      },
      // Legibility: the two smallest steps are used for most body copy on
      // inner pages, so they are raised (root is 17px): xs ≈ 15px, sm = 17px.
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.45rem' }],
        sm: ['1rem', { lineHeight: '1.65rem' }],
        base: ['1.0625rem', { lineHeight: '1.75rem' }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        // legacy `font-serif` usages across pages now resolve to the display face
        serif: ["var(--font-sans)", "system-ui", "sans-serif"],
        soft: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'cube': '0 10px 30px -12px rgba(36,50,57, 0.22), 0 4px 6px -4px rgba(36,50,57, 0.12)',
        'cube-hover': '0 20px 40px -16px rgba(36,50,57, 0.3), 0 8px 16px -6px rgba(196, 146, 27, 0.2)',
        'cube-glow': '0 0 25px rgba(196, 146, 27, 0.4)',
        'glass': '0 18px 50px -24px rgba(36,50,57, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-hover': '0 28px 70px -28px rgba(36,50,57, 0.38), 0 0 0 1px rgba(196, 146, 27, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
        'cube-navy-glow': '0 0 25px rgba(43, 59, 68, 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'riseIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float-y': 'floatY 6s ease-in-out infinite',
        'gold-pulse': 'goldPulse 2.5s ease-out infinite',
        aurora: 'aurora 28s ease-in-out infinite alternate',
        'aurora-slow': 'aurora 40s ease-in-out infinite alternate-reverse',
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
        aurora: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(6%, -4%, 0) scale(1.08)' },
          '100%': { transform: 'translate3d(-4%, 6%, 0) scale(0.96)' },
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
