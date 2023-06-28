/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.vue",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ["basis-grotesque", "Helvetica", "Arial", "sans-serif"],
    },
    extend: {
      transformOrigin: {
        0: "0%",
      },
      screens: {
        "2xs": "400px",
        xs: "480px",
      },
      fontSize: {
        "3xl": "2rem",
        "4xl": "2.5rem",
        "10xl": "12rem",
      },
      spacing: {
        13: "3.25rem",
        18: "4.5rem",
        21: "5.25rem",
        23: "5.75rem",
        25: "6.4rem",
        34: "8.5rem",
        76: "18.5rem",
        128: "26rem",
        192: "30rem",
        224: "36rem",
        256: "60rem",
        264: "76rem",
      },
      rotate: {
        15: "15deg",
        25: "25deg",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
};
