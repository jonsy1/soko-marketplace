/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        night: '#16233D',
        market: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#2F6FED',
          600: '#1D4ED8',
        },
        teal: {
          50: '#ECFDF5',
          400: '#34D399',
          500: '#10B981',
          600: '#047857',
        },
        clay: {
          DEFAULT: '#F0602E',
          50: '#FFF1EC',
          400: '#F97B52',
          500: '#F0602E',
          600: '#D8481B',
        },
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