/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        autoforce: {
          blue: '#1440FF',
          dark: '#00020A',
          orange: '#FFA814',
          yellow: '#FFC434',
          gray: '#4E5265',
          surface: '#1A1D26',
        }
      },
      fontFamily: {
        sans: ['Titillium Web', 'sans-serif'],
        heading: ['Titillium Web', 'sans-serif'],
      },
      backgroundImage: {
        'racer-gradient': 'linear-gradient(135deg, #00020A 0%, #1440FF 100%)',
      }
    },
  },
  plugins: [],
}
