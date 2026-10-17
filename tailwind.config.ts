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
          vivid: "#059669",
        },
        gold: {
          DEFAULT: "#F59E0B",
          warm: "#F59E0B",
          light: "#FDE68A",
          muted: "#D97706",
          dim: "#92400E",
          dark: "#78350F",
          champagne: "#FBF5E6",
          metallic: "#E5A93C",
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
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        playfair: ["var(--font-playfair)", "Playfair Display", "serif"],
        thai: ["var(--font-prompt)", "Prompt", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        "thai-serif": ["var(--font-noto-serif-thai)", "Noto Serif Thai", "Georgia", "serif"],
        serif: ["var(--font-cinzel)", "var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-prompt)", "Prompt", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)",
        "gold-metallic": "linear-gradient(135deg, #FFF6DC 0%, #F59E0B 35%, #D97706 70%, #92400E 100%)",
        "emerald-glow": "radial-gradient(circle at 50% 30%, rgba(15, 41, 30, 0.9) 0%, rgba(11, 19, 16, 0.98) 100%)",
        "card-gradient": "linear-gradient(180deg, rgba(18, 37, 29, 0.85) 0%, rgba(11, 19, 16, 0.98) 100%)",
        "luxury-overlay": "linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 40%, rgba(15, 41, 30, 0.3) 100%)",
      },
      boxShadow: {
        "gold-sm": "0 0 15px rgba(245, 158, 11, 0.2)",
        "gold-md": "0 0 30px rgba(245, 158, 11, 0.3)",
        "gold-luxury": "0 10px 50px -10px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(245, 158, 11, 0.4)",
        "emerald-glow": "0 10px 40px -10px rgba(15, 41, 30, 0.7)",
        "card-luxury": "0 20px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(245, 158, 11, 0.25)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
