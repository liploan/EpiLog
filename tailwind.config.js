/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        atelier: {
          paper: '#faf7f2',
          surface: '#ffffff',
          warm: '#f3ece1',
          linen: '#eadecb',
          border: '#e7ded1',
          'border-dark': '#2e2823',
          ink: '#1c1917',
          'ink-muted': '#57534e',
          'ink-faint': '#8c827a',
          terracotta: '#b85429',
          'terracotta-dark': '#933e1a',
          'terracotta-light': '#df7c51',
          ochre: '#b87c2b',
          'ochre-light': '#dca85b',
          olive: '#485e43',
          clay: '#96614e',
        },
        primary: {
          DEFAULT: '#b85429', // Warm refined terracotta
          dark: '#933e1a',
          light: '#df7c51',
        },
        sand: {
          50: '#fdfbf7',
          100: '#faf7f2',
          200: '#f3ece1',
          300: '#eadecb',
          400: '#d5c3aa',
          500: '#b8a387',
          600: '#8c785f',
          700: '#5c4c39',
          800: '#382f24',
          900: '#1e1914',
          950: '#14100c',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'Cambria', 'serif'],
        display: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(35, 25, 15, 0.04)',
        'editorial': '0 8px 30px rgba(35, 25, 15, 0.06)',
        'elevated': '0 16px 40px rgba(35, 25, 15, 0.09)',
        'monograph': '0 25px 60px -15px rgba(28, 25, 23, 0.15), 0 0 1px rgba(0,0,0,0.1)',
        'card-glow': '0 0 25px rgba(184, 84, 41, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
