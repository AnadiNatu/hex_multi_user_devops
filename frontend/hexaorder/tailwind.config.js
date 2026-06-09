/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-green': '#10b981',
        'brand-blue': '#dbeafe',
      },
    },
  },
  plugins: [],
}