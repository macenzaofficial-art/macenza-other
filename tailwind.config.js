/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        faculty: ['"Faculty Glyphic"', 'sans-serif'],
        pinyon: ['"Pinyon Script"', 'cursive'],
        turret: ['"Turret Road"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          light: "#60a5fa",
          dark: "#1d4ed8",
        },
        dark: "#0f172a",
        accent: "#4F46E5",
      },
    },
  },
  plugins: [],
}
