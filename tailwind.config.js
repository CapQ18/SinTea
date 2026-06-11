/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAFAFA',
        'bg-gray': '#F5F5F5',
        primary: '#8B7355',
        'primary-light': '#A69076',
        secondary: '#E8B87D',
        accent: '#F5D0A9',
        success: '#6BAA75',
        warning: '#E8919C',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'text-gray': '#999999',
        border: '#E8E8E8',
        'border-light': '#F0F0F0',
      },
      borderRadius: {
        'lg': '16px',
        'md': '12px',
        'sm': '8px',
        'button': '20px',
        'circle': '50%',
      },
      fontSize: {
        'xs': '10px',
        'sm': '12px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        'xxl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse': 'pulse 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
