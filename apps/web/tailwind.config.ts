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
        brand: {
          50: "#e6f4fe",
          100: "#cfeafd",
          200: "#a5d6fb",
          300: "#75bef8",
          400: "#45a6f3",
          500: "#1a9deb",
          600: "#0f87d4",
          700: "#0c6eae",
          800: "#0b5688",
          900: "#0a4068",
          950: "#082a47",
        },
        accent: {
          50: "#e3f8ef",
          100: "#c8f1df",
          200: "#97e3c2",
          300: "#5fd1a1",
          400: "#2fc282",
          500: "#1abf7a",
          600: "#14a468",
          700: "#108555",
          800: "#0d6943",
          900: "#0a5034",
          950: "#053522",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
