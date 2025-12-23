import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        display: ["var(--font-display)", ...fontFamily.sans],
      },
      colors: {
        background: "var(--bg)",
        foreground: "var(--primary-900)",
        border: "var(--border)",
        divider: "var(--divider)",
        muted: "var(--muted)",
        mutedText: "var(--muted)",
        text: "var(--primary-900)",
        card: "var(--surface-1)",
        primary: {
          900: "var(--primary-900)",
          800: "var(--primary-800)",
          700: "var(--primary-700)",
          DEFAULT: "var(--primary-700)",
          foreground: "var(--surface-1)",
        },
        brand: "var(--primary-700)",
        brand2: "var(--accent-500)",
        accent: {
          500: "var(--accent-500)",
          400: "var(--accent-400)",
          200: "var(--accent-200)",
          DEFAULT: "var(--accent-500)",
        },
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        success: "#1b9a78",
        warning: "#e49b2e",
        danger: "#d64545",
      },
      borderRadius: {
        lg: "var(--r-lg)",
        md: "var(--r-md)",
        sm: "var(--r-sm)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        "elev-1": "var(--elev-1)",
        "elev-2": "var(--elev-2)",
      },
      backgroundImage: {
        "hero-tint": "var(--hero-tint)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseBadge: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.12)" },
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "badge-bounce": "pulseBadge 800ms ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
