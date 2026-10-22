/** @type {import('tailwindcss').Config} */

// Clubstride CI v1.0.0 palette. Values mirror clubstride-tokens.css and are
// duplicated as literals here because Tailwind needs concrete colours to
// compute opacity modifiers (e.g. `bg-obsidian-950/85`).
const ci = {
  liteBg: '#0A1630',        // --cs-lite-bg
  liteSurface: '#13224A',   // --cs-lite-surface
  liteRaised: '#1B2E5E',    // --cs-lite-surface-raised
  liteText: '#FFFFFF',      // --cs-lite-text
  liteMuted: '#B8C6E6',     // --cs-lite-text-muted
  primary: '#22D3EE',       // --cs-lite-primary
  onDark: '#06142B',        // --cs-lite-on-primary
  go: '#3BE38A',            // --cs-lite-go / --cs-match-sub-in
  goDeep: '#1FB868',        // sub-in badge gradient stop
  accent: '#C8F230',        // --cs-lite-accent / --cs-match-goal
  danger: '#FF8A80',        // --cs-lite-danger / --cs-match-sub-out
  dangerDeep: '#E8615A',    // sub-out badge gradient stop
  assist: '#2DD4BF',        // --cs-match-assist / --cs-teal-300
  assistDeep: '#0B5F59',    // --cs-teal-700
  navy700: '#1C3764',       // --cs-navy-700
  navy900: '#0B1B33',       // --cs-navy-900
  navy950: '#060D18',       // --cs-navy-950 / --cs-match-bg
  cardYellow: '#FFD500',    // --cs-card-yellow
  cardRed: '#D7141A',       // --cs-card-red
  amber300: '#FBBF24',      // --cs-amber-300
  amber500: '#F59E0B',      // --cs-amber-500
  amber700: '#B45309',      // --cs-amber-700
  blue400: '#38BDF8',       // --cs-blue-400
  blue600: '#1D4ED8'        // --cs-blue-600
};

module.exports = {
  content: ['./index.html', './test_app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: ci.liteBg,
          900: ci.liteSurface,
          800: ci.liteRaised,
          700: ci.navy700,
          ink: ci.onDark
        },
        cyber: {
          cyan: ci.primary,
          mint: ci.go,
          emerald: ci.accent,
          darkgreen: ci.assistDeep
        },
        slate: {
          50: '#F8FAFC',
          100: '#E6EBF1',
          200: '#D0D8E2',
          300: ci.liteMuted,
          400: ci.liteMuted,
          500: '#8391A3',
          600: '#444F61',
          700: '#303A4A',
          800: '#1E2735',
          900: ci.navy950,
          950: ci.navy950
        },
        emerald: {
          400: ci.go,
          500: ci.goDeep,
          600: '#0B8F55',
          700: ci.goDeep
        },
        green: { 500: ci.goDeep },
        sky: { 400: ci.assist, 500: ci.assistDeep },
        teal: { 500: ci.assist },
        blue: { 500: ci.blue400, 600: ci.blue600 },
        red: { 400: ci.danger, 500: ci.dangerDeep, 600: ci.cardRed },
        amber: { 300: ci.amber300, 400: ci.cardYellow, 500: ci.amber500, 700: ci.amber700 },
        ci
      },
      borderRadius: {
        // CI core ramp: xs 4, sm 8, md 12 (=rounded-xl), lg 16 (=rounded-2xl),
        // xl 24, pill 999. Lite surfaces add 18 (rounded-lite) and 28 (rounded-lite-xl).
        lite: '18px',
        'lite-xl': '28px',
        pill: '9999px',
        'ci-xs': '4px',
        'ci-sm': '8px',
        'ci-md': '12px',
        'ci-lg': '16px',
        'ci-xl': '24px'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Fredoka', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};


