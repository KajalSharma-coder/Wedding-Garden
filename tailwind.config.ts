import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        maroon: "#5b1020",
        wine: "#2a0710",
        gold: "#D4AF37",
        cream: "#FFF8E7",
        ivory: "#FFFAF0",
        ink: "#11090c"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(212, 175, 55, 0.26)",
        glass: "0 22px 80px rgba(17, 9, 12, 0.34)",
        premium: "0 18px 60px rgba(0, 0, 0, 0.32)"
      },
      backgroundImage: {
        luxury: "linear-gradient(135deg, #2a0710 0%, #5b1020 42%, #D4AF37 100%)",
        silk: "radial-gradient(circle at top left, rgba(212,175,55,.2), transparent 35%), linear-gradient(135deg, #11090c 0%, #2a0710 55%, #5b1020 100%)"
      }
    }
  },
  plugins: []
};

export default config;
