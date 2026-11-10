/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // The public site follows src/styles/cp-ui.css, written against the browser defaults
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'uece-green': '#00623B',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
