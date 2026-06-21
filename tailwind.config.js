/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Fixed desk chrome (theme-independent) — sepia 1970s archive ---
        bg: '#E5D7BD', // desk background (toasted archive paper)
        surface: '#F1E7D1', // sidebars / panels (light archive paper)
        'surface-2': '#D7C6A5', // nested blocks inside panels
        border: '#C5AF87', // panel / block borders
        ink: '#2A2117', // text on white document paper
        success: '#5C7A33', // Approve (retro olive green)
        danger: '#B23A2E', // Reject
        gold: '#C98A2E', // daily-case highlight (fill/border/icon only)
        'gold-dark': '#3A2705',
        'gold-text': '#F0C46B',
        'text-light': '#3D3119', // primary text on sepia chrome
        'text-muted': '#6B5733', // secondary text on sepia chrome
        'text-dim': '#6B5733', // muted labels on sepia chrome

        // --- Folder theme (manila | dossier) via CSS vars ---
        // RGB channels so Tailwind's /opacity modifier keeps working.
        paper: 'rgb(var(--paper) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        folder: 'rgb(var(--folder) / <alpha-value>)',
        'folder-edge': 'rgb(var(--folder-edge) / <alpha-value>)',
        stamp: 'rgb(var(--stamp) / <alpha-value>)',
        // Text drawn directly on a folder cover (adapts per theme).
        'folder-ink': 'var(--folder-ink)',
        'folder-ink-soft': 'var(--folder-ink-soft)',
      },
      fontFamily: {
        serif: ['"IBM Plex Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 3px rgba(0,0,0,0.18)',
        folder: '0 18px 40px rgba(0,0,0,0.5)',
        doc: '0 14px 34px rgba(0,0,0,0.45)',
        card: '0 6px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 16px 30px rgba(0,0,0,0.45)',
        lift: '0 16px 30px rgba(0,0,0,0.45)',
        modal: '0 30px 70px rgba(0,0,0,0.6)',
      },
      keyframes: {
        stampIn: {
          '0%': {
            opacity: '0',
            transform: 'translate(-50%,-50%) rotate(-13deg) scale(2.6)',
          },
          '55%': { opacity: '0.9' },
          '100%': {
            opacity: '0.88',
            transform: 'translate(-50%,-50%) rotate(-13deg) scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
};
