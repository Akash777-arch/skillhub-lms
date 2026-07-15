/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          glass: 'var(--bg-glass)',
        },
        brand: {
          purple: 'var(--brand-purple)',
          blue: 'var(--brand-blue)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        semantic: {
          success: 'var(--success)',
          danger: 'var(--danger)',
          warning: 'var(--warning)',
          info: 'var(--info)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      zIndex: {
        dropdown: '40',
        navbar: '50',
        drawer: '60',
        modalBackdrop: '90',
        modal: '100',
        toast: '110',
      },
    },
  },
  plugins: [],
}
