/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderColor: {
        border: "var(--border)",
      },
      ringColor: {
        ring: "var(--ring)",
      },
    },
  },
  plugins: [],
};
