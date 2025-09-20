/** @type {import('next-i18next').UserConfig} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // if you're using the App Router
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'kh'], // Add your languages—here English and Khmer
  },
  theme: {
    extend: {},
  },
  plugins: [scrollbar],
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
