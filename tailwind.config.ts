import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",   // include pages if you have them
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // must be "class" for class-based dark mode
  theme: {
    extend: {},       // add custom colors, spacing, etc. if needed
  },
};

export default config;
