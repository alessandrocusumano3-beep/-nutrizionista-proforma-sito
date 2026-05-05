import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          /** Warm off-white — main canvas */
          canvas: "#FAF9F6",
          /** Section surfaces with a whisper of green */
          light: "#F4F6F3",
          /** Body / headings — deep green-grey for readability */
          dark: "#1C2E24",
          /** CTAs, key UI — deep forest green */
          primary: "#1E4634",
          /** Muted sage for borders, chips, soft fills */
          accent: "#B4C8B8",
          /** Dark band (e.g. contact) — green-black, not pure slate */
          sectionDark: "#13251D"
        }
      }
    }
  },
  plugins: []
};

export default config;
