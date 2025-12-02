/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E55A2B',
          light: '#FF8C5A',
        },
        gray: {
          DEFAULT: '#6B7280',
          light: '#F3F4F6',
          dark: '#374151',
        }
      },
    },
  },
  plugins: [],
}

