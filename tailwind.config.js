/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Vazirmatn', 'sans-serif'],
        body: ['Inter', 'Vazirmatn', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f1ff', 100: '#ede4ff', 200: '#dccbff', 300: '#c3a4ff',
          400: '#a878ff', 500: '#9050f5', 600: '#7c33e0', 700: '#6924bd',
          800: '#561f99', 900: '#451a7a', 950: '#2b0f52',
        },
      },
    },
  },
  plugins: [],
};
