/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#151f32',
          900: '#0f1c2d',
          925: '#0c1524',
          950: '#0a111a',
        },
        itms: {
          bg: '#0a111a',
          card: '#0f1c2d',
          cardHover: '#132338',
          border: '#192c43',
          orange: '#f97316',
          orangeLight: '#ff8a3d',
          teal: '#06b6d4',
          tealDark: '#0891b2',
          darkTeal: '#0d9488',
        },
        brand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        }
      }
    },
  },
  plugins: [],
}

