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
        'mobile-bar': '#F4E9D3',
        'mobile-bar-border': '#DDD0B6',
        'mobile-ink': '#3A3024',
        'mobile-muted': '#A89A80',
        'mobile-muted-strong': '#9A8C6E',
        'mobile-success': '#3F8F4E',
        'mobile-success-soft': '#4F8A4A',
        'daily-ink': '#3A2705',
        'daily-copy': '#5C3F08',
        'daily-border': '#B07D1F',
        'folder-gold': '#D8B95E',
        'folder-gold-edge': '#876520',
        'folder-gold-copy': '#6E5A24',
        'folder-gold-ink': '#2E2207',
        'folder-gold-pattern': '#5C4A1A',
        'mobile-solved': '#F3ECDD',
        'mobile-solved-border': '#DCD0B6',
        'mobile-locked': '#E3DDCF',
        'mobile-locked-border': '#D3CCBB',
        'mobile-locked-icon': '#C5BCA6',
        'mobile-locked-text': '#7A7058',
        'mobile-locked-muted': '#9B937F',
        'mobile-locked-count': '#B3AB98',
        'photo-border': '#B8B1A0',
        'photo-bg': '#D8D3C7',
        'photo-caption': '#8A8472',
        'document-title': '#1F2937',
        'document-copy': '#374151',
        'document-muted': '#6B7280',
        'document-faint': '#9CA3AF',
        'document-rule': '#D1CFC8',
        'document-dash': '#C7C2B6',
        toast: '#2B2018',
        'toast-ink': '#FEE2E2',
        'modal-backdrop': 'rgb(8 11 17 / 0.8)',

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
        'mobile-daily': '0 12px 26px rgba(40,28,10,.2)',
        'mobile-folder': '0 14px 30px rgba(135,101,32,.26)',
        'photo-id': '0 3px 9px rgba(0,0,0,.2)',
      },
      backgroundImage: {
        'daily-card': 'linear-gradient(135deg,#e6b052,#d6982f)',
        'folder-sealed': 'repeating-linear-gradient(135deg,#c6ad55 0 6px,#bda049 6px 12px)',
        'photo-placeholder': 'repeating-linear-gradient(45deg,#d8d3c7 0 6px,#cfc9bb 6px 12px)',
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
