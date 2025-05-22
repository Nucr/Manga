/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kuzey: {
          dark: '#1a2238',
          ice: '#eaeaea',
          blue: '#21a0a0',
          light: '#9daaf2',
          red: '#ff6a3d',
          purple: '#5e60ce',
        },
      },
    },
  },
  plugins: [],
} 