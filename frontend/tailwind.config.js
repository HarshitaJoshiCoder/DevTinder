/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#14121F', // page background
          900: '#1E1B2E', // card / panel surface
          800: '#2A2640', // raised surface / hover
          700: '#3D3856', // borders
        },
        accent: {
          // "connect" - primary action, the vibrant coral identity color
          coral: '#FF4D6D',
          // secondary accent - decorative highlights, tags, celebration moments
          yellow: '#FFC145',
        },
        match: {
          // reserved for the match celebration moment only
          gold: '#FFC145',
        },
        pass: {
          rose: '#F4527E',
        },
        ink: {
          100: '#E7ECF7',
          400: '#93A0BF',
          // dark text tones for use on light/white surfaces (cards)
          600: '#5B5A72',
          900: '#1B1A2E',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};