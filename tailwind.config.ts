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
        emerald: {
          deep: "#0F291E",
          dark: "#081610",
          card: "#12251D",
          surface: "#183226",
          border: "#1E3E30",
          light: "#2A5944",
        },
        gold: {
          DEFAULT: "#F59E0B",
          warm: "#F59E0B",
          light: "#FDE68A",
          muted: "#D97706",
          dim: "#92400E",
          dark: "#78350F",
        },
        parchment: {
          DEFAULT: "#F4F1EA",
          cream: "#F4F1EA",
          light: "#FAF8F5",
          muted: "#E2DDD2",
          dark: "#C5BFAe",
        },
        slate: {
          dark: "#0B1310",
          abyss: "#060A08",
          card: "#0E1814",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)",
        "emerald-glow": "radial-gradient(circle at 50% 30%, rgba(15, 41, 30, 0.8) 0%, rgba(11, 19, 16, 0.98) 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(18, 37, 29, 0.8) 0%, rgba(11, 19, 16, 0.95) 100%)",
      },
      boxShadow: {
        "gold-sm": "0 0 15px rgba(245, 158, 11, 0.15)",
        "gold-md": "0 0 25px rgba(245, 158, 11, 0.25)",
        "emerald-glow": "0 10px 40px -10px rgba(15, 41, 30, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
