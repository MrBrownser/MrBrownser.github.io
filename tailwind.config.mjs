/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        "subtle-foreground": "var(--subtle-foreground)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-solid": "var(--accent-solid)",
        "accent-solid-foreground": "var(--accent-solid-foreground)",
        edu: "var(--edu)",
        hairline: "var(--hairline)",
      },
      fontFamily: {
        sans: ['"Inter Variable"', "Inter", "system-ui", "sans-serif"],
        display: ['"Fraunces Variable"', "Fraunces", "Georgia", "serif"],
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
  plugins: [],
};
