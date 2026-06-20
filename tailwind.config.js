/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Fixed desk chrome (theme-independent) ---
        bg: '#111827', // desk background
        surface: '#1F2937', // sidebars / panels
        'surface-2': '#111827', // nested blocks inside panels
        border: '#374151', // panel / block borders
        ink: '#1F2937', // text on paper
        success: '#16A34A',
        danger: '#DC2626',
        gold: '#D9A441', // daily-case highlight
        'gold-dark': '#3A2705',
        'gold-text': '#F0C46B',
        'text-light': '#E5E7EB',
        'text-muted': '#9CA3AF',
        'text-dim': '#6B7280',

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
