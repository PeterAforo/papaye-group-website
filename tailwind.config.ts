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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#E50000",
          50: "#FFE5E5",
          100: "#FFCCCC",
          200: "#FF9999",
          300: "#FF6666",
          400: "#FF3333",
          500: "#E50000",
          600: "#CC0000",
          700: "#990000",
          800: "#660000",
          900: "#330000",
        },
        secondary: {
          DEFAULT: "#FFD200",
          50: "#FFFBE5",
          100: "#FFF7CC",
          200: "#FFEF99",
          300: "#FFE766",
          400: "#FFDF33",
          500: "#FFD200",
          600: "#CCB000",
          700: "#998400",
          800: "#665800",
          900: "#332C00",
        },
        dark: "#1A1A1A",
      },
      fontFamily: {
        heading: ["var(--font-noto-sans)", "sans-serif"],
        body: ["var(--font-noto-sans)", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "24px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
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
