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
      white: '#ffffff',
      gray: colors.gray,
      neutral: colors.neutral,
      success: {
        100: "#EBFDE1",
        200: "#D3FCC4",
        300: "#B4F8A5",
        400: "#96F28C",
        500: "#69EA67",
        600: "#4BC954",
        700: "#33A846",
        800: "#208739",
        900: "#137032",
      },
      primary: {
        100: "#EACBFE",
        200: "#D198FE",
        300: "#B465FE",
        400: "#983FFD",
        500: "#6C00FD",
        600: "#5300D9",
        700: "#3E00B6",
        800: "#2B0092",
        900: "#1E0079",
      },
      warning: {
        100: "#FEFAD0",
        200: "#FEF5A2",
        300: "#FEED74",
        400: "#FDE652",
        500: "#FCDA19",
        600: "#D8B712",
        700: "#B5960C",
        800: "#927607",
        900: "#786004",
      },
      danger: {
        100: "#FEDACB",
        200: "#FEAC98",
        300: "#FE7565",
        400: "#FD423F",
        500: "#fd0013",
        600: "#D90023",
        700: "#B6002E",
        800: "#920032",
        900: "#790034"
      },
      info: {
        100: "#CBF2FE",
        200: "#98E1FE",
        300: "#65C9FE",
        400: "#3FB1FD",
        500: "#008AFC",
        600: "#006AD8",
        700: "#004FB5",
        800: "#003892",
        900: "#002778",
      }
    }
  },
  plugins: []
}
