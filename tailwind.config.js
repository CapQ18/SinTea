/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'milk-tea': {
          50: '#FFF8F0',
          100: '#FDF0E1',
          200: '#F9E0C4',
          300: '#F2CB9F',
          400: '#E8B57A',
          500: '#D4A574',
          600: '#C4915D',
          700: '#A67A4A',
          800: '#88633D',
          900: '#5C4033',
        },
        'matcha': {
          50: '#F0F7F0',
          100: '#DCEBDC',
          200: '#BBD9BB',
          300: '#9AC69A',
          400: '#8FBC8F',
          500: '#7CB37C',
          600: '#669A66',
          700: '#517F51',
          800: '#416641',
          900: '#365236',
        },
        'cream': '#FFF8F0',
        'dark-brown': '#5C4033',
      },
      fontFamily: {
        'sans': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
