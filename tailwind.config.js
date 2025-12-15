/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    colors: {
      white: "#ffffff",
      black: "#000000",
      transparent: "transparent",
      primary: "#D4AF37",
      "primary-hover": "#C5A028",
      "background-light": "#f4f4f5",
      "background-dark": "#18181b",
      "card-dark": "#27272a",
      "border-subtle": "#3f3f46",
      "text-light": "#f4f4f5",
      "text-muted": "#a1a1aa",
    },
    fontFamily: {
      display: ["Be Vietnam Pro", "sans-serif"],
      body: ["Noto Sans", "sans-serif"],
      sans: ["Noto Sans", "sans-serif"],
    },
    borderRadius: {
      DEFAULT: "0.5rem",
      lg: "0.75rem",
      xl: "1.5rem",
      "2xl": "2rem",
      full: "9999px",
    },
    animation: {
      "fade-in-up": "fadeInUp 0.8s ease-out forwards",
    },
    keyframes: {
      fadeInUp: {
        "0%": { opacity: "0", transform: "translateY(20px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },
  },
  plugins: [],
};
