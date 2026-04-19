/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-950': '#080C18',
        dark: {
          900: '#0A0F1E',
          800: '#1e293b',
          700: '#334155'
        },
        primary: {
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa'
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'gradient-x': 'gradient-x 3s ease infinite'
      }
    },
  },
  plugins: [],
}
