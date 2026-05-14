/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          200: '#b5cbff',
          300: '#85a8ff',
          400: '#587fff',
          500: '#3458ff',
          600: '#1f3ee0',
          700: '#1a31b3',
          800: '#172a8c',
          900: '#15276f',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        ink: {
          900: '#0b1020',
          800: '#111733',
          700: '#1b2447',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px -10px rgba(52, 88, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
