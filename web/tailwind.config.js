/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        maroon: { DEFAULT: '#68202B', dark: '#521922', light: '#7E2C38', soft: '#F6E9E9' },
        gold: { DEFAULT: '#C49C5C', dark: '#A98040', soft: '#E9D8B8' },
        cream: { DEFAULT: '#FFF7EC', deep: '#F4E8D4', line: '#E8D7BD' },
        ink: { DEFAULT: '#2B1418', soft: '#6F5A5D' },
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
        card: '0 2px 14px rgba(104,32,43,0.07)',
        btn: '0 8px 18px rgba(104,32,43,0.25)',
      },
      minHeight: { tap: '2.75rem' },
      minWidth: { tap: '2.75rem' },
    },
  },
  plugins: [],
};
