/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nn-primary': {
          400: '#6f8cf6',
          500: '#4f6cf0',
        },
        'nn-accent': {
          200: '#b9e8ff',
          400: '#6fd6ff',
          500: '#2bc7ff',
        },
      },
    },
  },
  plugins: [],
};
