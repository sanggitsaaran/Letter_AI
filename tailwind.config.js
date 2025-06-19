/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme' // <-- Import this

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Add 'Inter' as the default sans-serif font
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

