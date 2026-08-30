/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        night: '#2A0E52',
        market: {
          50: '#F1EEFF',
          100: '#E4DBFF',
          400: '#7C8CFF',
          500: '#5B6EF5',
          600: '#4338CA',
        },
        teal: {
          50: '#FFF7E6',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#B45309',
        },
        clay: '#EC4899',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};