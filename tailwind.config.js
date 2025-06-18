/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark', 'light'],
    logs: true,
  },
};
