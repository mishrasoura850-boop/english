/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', '"Kalam"', '"Patrick Hand"', 'cursive'],
        notebook: ['"Patrick Hand"', '"Caveat"', 'cursive'],
        kalam: ['"Kalam"', 'cursive'],
      },
      colors: {
        notebook: {
          bg: '#fdfbf7',
          paper: '#fffef9',
          lines: '#d4e4ed',
          margin: '#f87171',
          shadow: '#e5e0d8',
        },
        pen: {
          blue: '#1e3a8a',
          red: '#dc2626',
          darkRed: '#991b1b',
          green: '#15803d',
          pencil: '#4b5563',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      boxShadow: {
        'notebook': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.05)',
        'notebook-deep': '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'teacher-stamp': '0 2px 8px rgba(220, 38, 38, 0.25)',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}

