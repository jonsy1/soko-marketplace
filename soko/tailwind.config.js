/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12181B',
        night: '#0E2A2F',
        market: {
          50: '#FFF8EC',
          100: '#FEEBC3',
          400: '#E8A93A',
          500: '#D68C2A',
          600: '#B36E1B',
        },
        teal: {
          50: '#EAF6F4',
          400: '#2E9E8F',
          500: '#1E8073',
          600: '#146157',
        },
        clay: '#C0552F',
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
