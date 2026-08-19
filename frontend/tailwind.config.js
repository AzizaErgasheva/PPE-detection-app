/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: "#1C1F22",
          light: "#262A2E",
          lighter: "#33383D",
        },
        safety: {
          yellow: "#F2C744",
          amber: "#E8A93C",
        },
        alert: "#E4572E",
        safe: "#4C9A6D",
        steel: "#6B7280",
        paper: "#F3F1EC",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "hazard-stripes":
          "repeating-linear-gradient(45deg, #F2C744, #F2C744 12px, #1C1F22 12px, #1C1F22 24px)",
      },
    },
  },
  plugins: [],
}
