/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "media",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../00-auth/src/**/*.{ts,tsx}",
    "../01-admin/src/**/*.{ts,tsx}",
    "../02-exam/src/**/*.{ts,tsx}",
    "../03-answers/src/**/*.{ts,tsx}",
    "../04-study/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
