/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        zero: {
          black: '#000000',
          surface: '#0A0A0A',
          panel: '#121212',
          card: '#1A1A1A',
          pill: '#1E1E1E',
          border: '#1E1E1E',
          borderLight: '#2A2A2A',
          muted: '#888888',
          red: '#E30613',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        mega: '0.35em',
      },
    },
  },
  plugins: [],
};
