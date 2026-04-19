/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: { 400:'#fb923c', 500:'#f97316', 600:'#ea580c' },
        dark:  { 600:'#252538', 700:'#1a1a28', 800:'#111118', 900:'#0a0a0f' },
      },
    },
  },
  plugins: [],
}
