/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        night: '#0B1F3A',
        market: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#3B82F6',
          500: '#2563EB',
          600: '#1D4ED8',
        },
        teal: {
          50: '#ECFEFF',
          400: '#22D3EE',
          500: '#0891B2',
          600: '#0E7490',
        },
        clay: '#F59E0B',
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