/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F0',
        'milk-tea': '#F5D0A9',
        caramel: '#E8B87D',
        'dark-brown': '#5C4033',
        'mid-brown': '#8B7355',
        matcha: '#90C695',
        rose: '#E8919C',
        border: '#F0E6D8',
        gray: '#C4B5A5',
      },
      borderRadius: {
        'large': '16px',
        'medium': '12px',
        'button': '24px',
        'tag': '8px',
      },
      animation: {
        blink: 'blink 3s infinite',
        breathe: 'breathe 2s ease-in-out infinite',
        shake: 'shake 0.3s ease-in-out',
        jump: 'jump 0.5s ease-in-out',
        steam: 'steam 1.5s ease-out infinite',
        spin: 'spin 1s linear infinite',
        float: 'float 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
