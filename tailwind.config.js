/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#1a1a1a',
      white: '#fefefe',
      gray: colors.gray,
      neutral: colors.neutral,
      success: {
        500: '#00c975',
        200: '#99e9c8',
        100: '#ccf4e3',
        50: '#e6faf1'
      },
      primary: {
        900: '#001e33',
        500: '#0095ff',
        200: '#99d5ff',
        100: '#cceaff',
        50: '#e6f4ff'
      },
      warning: {
        500: '#ffd000',
        200: '#ffec99',
        100: '#fff6cc',
        50: '#fffae6'
      },
      danger: {
        500: '#ff0655',
        200: '#ff9bbb',
        100: '#ffcddd',
        50: '#ffe6ee'
      }
    }
  },
  plugins: []
}
