/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Add this if using src directory
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          100: '#FFF9E6',
          500: '#FFD700',
          600: '#D4AF37',
        },
      }
    },
  },
  plugins: [],
}