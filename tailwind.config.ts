import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        violet: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 4px)",
        sm:   "calc(var(--radius) - 8px)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          "60%":{ opacity: "1", transform: "translateY(-3px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.85) rotate(-2deg)" },
          "70%":{ transform: "scale(1.08) rotate(1deg)" },
          to:   { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "icon-pop": {
          "0%":  { transform: "rotate(0deg)   scale(1)" },
          "30%": { transform: "rotate(-12deg) scale(1.15)" },
          "65%": { transform: "rotate(4deg)   scale(1.05)" },
          "100%":{ transform: "rotate(0deg)   scale(1)" },
        },
        "count-in": {
          from: { opacity: "0", transform: "translateY(8px)", filter: "blur(6px)" },
          to:   { opacity: "1", transform: "translateY(0)",   filter: "blur(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { transform: "scale(1)",   opacity: "1" },
          "50%":       { transform: "scale(1.6)", opacity: "0.7" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-up":        "fade-up 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        "scale-in":       "scale-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-up":       "slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "icon-pop":       "icon-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
        "count-in":       "count-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "pulse-dot":      "pulse-dot 1.5s ease-in-out infinite",
        float:            "float 3s ease-in-out infinite",
      },
      boxShadow: {
        "violet-sm": "0 2px 8px  hsl(262 83% 58% / 0.15)",
        "violet-md": "0 4px 16px hsl(262 83% 58% / 0.20)",
        "violet-lg": "0 8px 32px hsl(262 83% 58% / 0.25)",
        "card":      "0 1px 4px hsl(262 20% 12% / 0.06), 0 4px 16px hsl(262 20% 12% / 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
