import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "glow-pulse": "glow-pulse 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 18px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 40px -18px hsl(16 60% 60% / 0.32)",
          },
          "50%": {
            boxShadow: "0 0 55px -18px hsl(16 60% 60% / 0.48)",
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
