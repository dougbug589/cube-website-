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
        // Official CUBE Brand Color System (Extracted from Logo)
        navy: {
          DEFAULT: "#070E5C",
          950: "#070E5C", // Deep CUBE Navy (Brand Core)
          900: "#0B156F",
          850: "#101D82",
          800: "#162594",
          700: "#1E33B0",
          600: "#2B43CB",
          50: "#F0F2FA",
        },
        gold: {
          DEFAULT: "#D7A00F",
          600: "#BF8C0B", // Darker gold for active/hover
          500: "#D7A00F", // Core CUBE Gold (Brand Accent)
          400: "#E3B127",
          300: "#EEC450",
          200: "#F6DA86",
          100: "#FDF6DE", // Soft gold tint
          50: "#FFFCF4",
        },
        silver: {
          DEFAULT: "#C4CAD8",
          300: "#D6DBE5",
          400: "#C4CAD8",
          500: "#A9B1C3",
        },
        'light-grey': "#F4F5F8",
        slate: {
          50: "#F4F5F8",
          100: "#EBEEF5",
          200: "#DCE1EB",
          300: "#C4CAD8",
          400: "#8F9CAE",
          500: "#606F85",
          600: "#455368",
          700: "#2D3748",
          800: "#1A2234",
          900: "#0D1322",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        'cube': '0 10px 30px -10px rgba(7, 14, 92, 0.12), 0 4px 6px -4px rgba(7, 14, 92, 0.08)',
        'cube-hover': '0 20px 40px -15px rgba(7, 14, 92, 0.22), 0 8px 16px -6px rgba(215, 160, 15, 0.22)',
        'cube-glow': '0 0 25px rgba(215, 160, 15, 0.4)',
        'cube-navy-glow': '0 0 25px rgba(7, 14, 92, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        // Logo marquees: each track holds its list twice, so moving by -50%
        // loops seamlessly. Duration is set per track (inline style).
        marquee: 'marquee 60s linear infinite',
        'marquee-reverse': 'marquee 60s linear infinite reverse',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
