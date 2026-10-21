/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './test_app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: { 950: '#070d18', 900: '#0a1222', 800: '#111b2f', 700: '#1b2a47' },
        cyber: { cyan: '#00f2fe', mint: '#10b981', emerald: '#059669', darkgreen: '#064e3b' }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};


