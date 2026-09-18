/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0A0F1E', // page background
          900: '#101728', // card / panel surface
          800: '#1A2338', // raised surface / hover
          700: '#2A3550', // borders
        },
        accent: {
          // "online / connect" - primary action
          cyan: '#22D3EE',
        },
        match: {
          // reserved for the match celebration moment only
          violet: '#A78BFA',
        },
        pass: {
          rose: '#FB7185',
        },
        ink: {
          100: '#E7ECF7',
          400: '#93A0BF',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 60px -20px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
