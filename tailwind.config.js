/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Marcellus', 'serif'],
        body: ['Jost', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        technical: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        kaira: {
          ink: '#111111',
          sage: '#8c907e',
          'sage-dark': '#5e624e',
          line: '#f1f1f0',
        },
        shop: {
          canvas: '#F4F3EF',
          ink: '#0E0E0E',
          line: '#E3E1DA',
          accent: '#3D4FE0',
        },
      },
    },
  },
  plugins: [],
};
