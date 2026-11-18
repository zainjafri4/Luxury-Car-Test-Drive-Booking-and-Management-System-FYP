/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-faint': 'var(--text-faint)',
        gold: 'var(--gold)',
        'gold-hover': 'var(--gold-hover)',
        'gold-soft': 'var(--gold-soft)',
        'on-gold': 'var(--on-gold)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        input: '8px',
        card: '14px',
        modal: '18px',
        badge: '999px',
      },
      maxWidth: {
        container: '1280px',
        admin: '1440px',
      },
      boxShadow: {
        modal: '0 20px 60px rgba(0,0,0,0.5)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '250ms',
        image: '500ms',
      },
    },
  },
  plugins: [],
};

