import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        ink: {
          50: "#f7f7f6",
          100: "#e9e8e4",
          200: "#d4d1c9",
          300: "#b3ae9f",
          400: "#8c8676",
          500: "#6b6557",
          600: "#534d42",
          700: "#3f3a32",
          800: "#2a2620",
          900: "#1a1713",
        },
        accent: {
          50: "#f0f7ff",
          100: "#dbecff",
          200: "#b7d9ff",
          300: "#83beff",
          400: "#4a9bff",
          500: "#2479f2",
          600: "#155bcc",
          700: "#1349a3",
          800: "#143f82",
          900: "#17376a",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
