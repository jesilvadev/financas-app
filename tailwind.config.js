/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Paleta principal
        primary: "#6B54EC",
        secondary: "#BFCBFF",

        // Tons neutros e utilitários
        layer: "#FFFFFF",
        disable: "#C4CCD5",
        description: "#676767",
        black: "#000000",
        white: "#FFFFFF",

        // Paleta de feedback / alerts
        success: "#1E8315", // Verde
        warning: "#FACC15", // Amarelo
        info: "#3B82F6", // Azul
        error: "#CD3131", // Vermelho
      },
    },
  },
  plugins: [],
};
