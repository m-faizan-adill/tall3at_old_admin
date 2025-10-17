/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15%)' }
        },
        glowPulse: {
          '0%, 100%': { 
            textShadow: '0 0 4px rgba(147, 51, 234, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            textShadow: '0 0 8px rgba(147, 51, 234, 0.6)',
            transform: 'scale(1.05)'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out forwards',
        bounce: 'bounce 0.5s ease-in-out',
        glowPulse: 'glowPulse 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}