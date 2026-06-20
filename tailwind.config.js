/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#111827',
        surface: '#1F2937',
        paper: '#F3F4F6',
        ink: '#1F2937',
        accent: '#2563EB',
        success: '#16A34A',
        danger: '#DC2626',
        gold: '#D97706',
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        folder: '0 20px 40px -12px rgba(0,0,0,0.55)',
        lift: '0 12px 20px -8px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
