/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
   "./<custom-folder>/**/*.{js,jsx,ts,tsx}", 
   "./Screens/**/*.{js, ts, jsx, tsx}",
   "./Components/**/*.{js, ts, jsx, tsx}",
  ],
    theme: {
      extend: {},
    },
    plugins: [],
  }

