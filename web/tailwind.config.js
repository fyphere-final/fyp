/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: '#641F2A', dark: '#4F1822', light: '#7A2C38', soft: '#F6E9E9' },
        gold: { DEFAULT: '#C6A15B', dark: '#A98040', soft: '#E7D3A9' },
        cream: { DEFAULT: '#FFF9F0', deep: '#F5E9D8', line: '#DFD0BC', track: '#EDDFCC' },
        ink: { DEFAULT: '#42151D', soft: '#85736B', faint: '#A58C8B' },
        label: '#873A46',
        ok: { DEFAULT: '#2E7D4F', soft: '#E7F3EA' },
        bad: { DEFAULT: '#B3372E', soft: '#FBEAE8' },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
        ui: ['"Noto Sans Arabic"', '"Noto Sans"', 'system-ui', 'sans-serif'],
        urdu: ['"Noto Nastaliq Urdu"', '"Noto Naskh Arabic"', 'serif'],
        arabic: ['"Amiri"', '"Scheherazade New"', '"Noto Naskh Arabic"', 'serif'],
      },
      boxShadow: {
        card: '0 4px 18px rgba(100,31,42,0.07)',
        soft: '0 8px 28px rgba(100,31,42,0.10)',
        btn: '0 8px 18px rgba(100,31,42,0.25)',
      },
      minHeight: { tap: '2.75rem' },
      minWidth: { tap: '2.75rem' },
    },
  },
  plugins: [],
};
