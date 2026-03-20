import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6750A4",
          container: "#EADDFF",
          "on": "#FFFFFF",
          "on-container": "#21005D",
        },
        secondary: {
          DEFAULT: "#625B71",
          container: "#E8DEF8",
          "on": "#FFFFFF",
          "on-container": "#1D192B",
        },
        tertiary: {
          DEFAULT: "#7D5260",
          container: "#FFD8E4",
          "on": "#FFFFFF",
          "on-container": "#31111D",
        },
        surface: {
          DEFAULT: "#FFFBFE",
          dim: "#DED8E1",
          bright: "#FFFBFE",
          "container-lowest": "#FFFFFF",
          "container-low": "#F7F2FA",
          container: "#F3EDF7",
          "container-high": "#ECE6F0",
          "container-highest": "#E6E0E9",
          variant: "#E7E0EC",
          "on": "#1C1B1F",
          "on-variant": "#49454F",
        },
        outline: {
          DEFAULT: "#79747E",
          variant: "#CAC4D0",
        },
        error: {
          DEFAULT: "#B3261E",
          container: "#F9DEDC",
          "on": "#FFFFFF",
          "on-container": "#410E0B",
        },
        success: {
          DEFAULT: "#386A20",
          container: "#B8F397",
        },
        warning: {
          DEFAULT: "#7D5800",
          container: "#FFDDB3",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "16px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "48px",
      },
      boxShadow: {
        "elevation-1": "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)",
        "elevation-2": "0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)",
        "elevation-3": "0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)",
        "elevation-4": "0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)",
        "elevation-5": "0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)",
      },
      transitionTimingFunction: {
        material: "cubic-bezier(0.2, 0, 0, 1)",
        "material-decelerate": "cubic-bezier(0, 0, 0, 1)",
        "material-accelerate": "cubic-bezier(0.3, 0, 1, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms cubic-bezier(0.2, 0, 0, 1)",
        "slide-up": "slide-up 400ms cubic-bezier(0.2, 0, 0, 1)",
        "scale-in": "scale-in 200ms cubic-bezier(0.2, 0, 0, 1)",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
