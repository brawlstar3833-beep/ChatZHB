/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#09090b", // zinc-950
          muted: "#18181b",   // zinc-900
          card: "#27272a",    // zinc-800
          border: "#3f3f46",  // zinc-700
        },
        accent: {
          DEFAULT: "#6366f1", // indigo-500
          light: "#818cf8",   // indigo-400
          dim: "#312e81",     // indigo-900
        },
        text: {
          primary: "#fafafa",
          secondary: "#a1a1aa",
          muted: "#52525b",
        },
      },
    },
  },
  plugins: [],
};